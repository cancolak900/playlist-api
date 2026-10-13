const { runAsync, getAsync, allAsync } = require("./db");
const Song = require("../domain/Song");

/**
 * List all songs with optional filtering and sorting.
 * @param {Object} options
 * @param {string} [options.genre]     - Filter by genre (exact match, case-insensitive)
 * @param {string} [options.sortBy]    - Column to sort by: title, artist, duration, genre
 * @param {string} [options.order]     - "asc" or "desc"
 * @param {string} [options.favorite]  - "true" to show only favorites
 */
const listSongs = async ({ genre, sortBy, order, favorite } = {}) => {
  let query = "SELECT * FROM songs";
  const conditions = [];
  const params = [];

  if (genre) {
    conditions.push("LOWER(genre) = LOWER(?)");
    params.push(genre);
  }

  if (favorite === "true") {
    conditions.push("isFavorite = 1");
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Whitelist sortable columns
  const allowedSort = ["title", "artist", "duration", "genre", "createdAt"];
  const col = allowedSort.includes(sortBy) ? sortBy : "id";
  const dir = order === "desc" ? "DESC" : "ASC";
  query += ` ORDER BY ${col} ${dir}`;

  const rows = await allAsync(query, params);
  return rows.map(Song.fromRow);
};

const getSongById = async (id) => {
  const row = await getAsync("SELECT * FROM songs WHERE id = ?", [id]);
  return Song.fromRow(row);
};

/**
 * Search songs by keyword across title, artist, and genre.
 */
const searchSongs = async (term) => {
  const rows = await allAsync(
    "SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR genre LIKE ?",
    [`%${term}%`, `%${term}%`, `%${term}%`]
  );
  return rows.map(Song.fromRow);
};

const insertSong = async (song) =>
  runAsync(
    "INSERT INTO songs (title, artist, duration, genre, isFavorite, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    [song.title, song.artist, song.duration, song.genre, song.isFavorite ? 1 : 0, song.createdAt]
  );

const updateSong = async (id, song) =>
  runAsync(
    "UPDATE songs SET title = ?, artist = ?, duration = ?, genre = ?, isFavorite = ? WHERE id = ?",
    [song.title, song.artist, song.duration, song.genre, song.isFavorite ? 1 : 0, id]
  );

const deleteSong = async (id) => runAsync("DELETE FROM songs WHERE id = ?", [id]);

/**
 * Get playlist statistics: total songs, total duration
 */
const getPlaylistStats = async () => {
  const row = await getAsync(
    "SELECT COUNT(*) AS totalSongs, COALESCE(SUM(duration), 0) AS totalDuration FROM songs"
  );
  return row;
};

module.exports = {
  listSongs,
  getSongById,
  searchSongs,
  insertSong,
  updateSong,
  deleteSong,
  getPlaylistStats,
};
