const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./docs/openapi.json");
const SongService = require("./services/songService");
const SongDto = require("./dto/SongDto");
const CreateSongDto = require("./dto/CreateSongDto");
const UpdateSongDto = require("./dto/UpdateSongDto");
const DtoValidationError = require("./dto/DtoValidationError");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Swagger document loaded from file; set server to relative origin so it works locally and when deployed
const swaggerDocument = { ...swaggerDoc, servers: [{ url: "/" }] };

const songService = new SongService();

const handleDtoValidationError = (err, res) => {
  if (err instanceof DtoValidationError) {
    res.status(err.statusCode).json({ error: err.message });
    return true;
  }
  return false;
};

// ─── SONGS ENDPOINTS ────────────────────────────────────────────────────────

/**
 * GET /songs
 * Optional query params: genre, favorite, sortBy, order
 */
app.get("/songs", async (req, res) => {
  const { genre, favorite, sortBy, order } = req.query;

  try {
    const songs = await songService.list({ genre, sortBy, order, favorite });
    res.json(SongDto.fromDomainList(songs));
  } catch (err) {
    console.error("Failed to list songs", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /songs/search
 * Query: keyword (required) – searches across title, artist, genre
 */
app.get("/songs/search", async (req, res) => {
  const { keyword } = req.query;

  if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'keyword' is required" });
  }

  try {
    const songs = await songService.search(keyword);
    res.json(SongDto.fromDomainList(songs));
  } catch (err) {
    console.error("Failed to search songs", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /songs/:id
 */
app.get("/songs/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const song = await songService.get(id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(SongDto.fromDomain(song));
  } catch (err) {
    console.error("Failed to fetch song", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /songs
 * Body: { "title": "...", "artist": "...", "duration": 212, "genre": "Pop", "isFavorite": false }
 * title, artist, duration are required
 */
app.post("/songs", async (req, res) => {
  let createSongDto;
  try {
    createSongDto = CreateSongDto.fromRequest(req.body);
  } catch (err) {
    if (handleDtoValidationError(err, res)) return;
    console.error("Failed to parse create song request", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    const song = await songService.create(createSongDto.toServiceInput());
    res.status(201).json(SongDto.fromDomain(song));
  } catch (err) {
    console.error("Failed to create song", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /songs/:id
 * Full replace (all fields required)
 */
app.put("/songs/:id", async (req, res) => {
  const id = Number(req.params.id);
  let updateSongDto;
  try {
    updateSongDto = UpdateSongDto.fromPutRequest(req.body);
  } catch (err) {
    if (handleDtoValidationError(err, res)) return;
    console.error("Failed to parse replace song request", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    const updated = await songService.replace(id, updateSongDto.toServiceInput());
    if (!updated) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(SongDto.fromDomain(updated));
  } catch (err) {
    console.error("Failed to replace song", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /songs/:id
 * Partial update (only provided fields)
 */
app.patch("/songs/:id", async (req, res) => {
  const id = Number(req.params.id);
  let updateSongDto;
  try {
    updateSongDto = UpdateSongDto.fromPatchRequest(req.body);
  } catch (err) {
    if (handleDtoValidationError(err, res)) return;
    console.error("Failed to parse update song request", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    const updated = await songService.update(id, updateSongDto.toServiceInput());
    if (!updated) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(SongDto.fromDomain(updated));
  } catch (err) {
    console.error("Failed to update song", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /songs/:id/favorite
 * Toggle favorite status
 */
app.patch("/songs/:id/favorite", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const updated = await songService.toggleFavorite(id);
    if (!updated) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(SongDto.fromDomain(updated));
  } catch (err) {
    console.error("Failed to toggle favorite", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /songs/:id
 */
app.delete("/songs/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const deleted = await songService.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json({ message: "Song removed from playlist", song: SongDto.fromDomain(deleted) });
  } catch (err) {
    console.error("Failed to delete song", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PLAYLIST ENDPOINTS ─────────────────────────────────────────────────────

/**
 * GET /playlist/stats
 * Returns total songs count and total duration
 */
app.get("/playlist/stats", async (req, res) => {
  try {
    const stats = await songService.getStats();
    res.json(stats);
  } catch (err) {
    console.error("Failed to get playlist stats", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GENERAL ─────────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.send("Playlist API is running 🎵");
});

// Expose the OpenAPI document as raw JSON
app.get("/docs/openapi.json", (req, res) => {
  res.json(swaggerDocument);
});
app.get("/openapi.json", (req, res) => {
  res.json(swaggerDocument);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Playlist API listening on http://localhost:${PORT}`);
});
