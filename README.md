# Playlist API – SE4458 Assignment 2

A simple REST API for managing a music playlist built with **Express.js** and **SQLite** (in-memory seed data).

## Group 2 – Playlist

### Team Member
- **CAN COLAK**

---

## Features

| Feature | Endpoint | Method |
|---|---|---|
| List all songs (with filter & sort) | `/songs` | GET |
| Search songs (title, artist, genre) | `/songs/search?keyword=...` | GET |
| Get a single song | `/songs/:id` | GET |
| Add a new song | `/songs` | POST |
| Replace a song (full update) | `/songs/:id` | PUT |
| Update a song (partial) | `/songs/:id` | PATCH |
| Toggle favorite | `/songs/:id/favorite` | PATCH |
| Remove a song | `/songs/:id` | DELETE |
| Playlist statistics | `/playlist/stats` | GET |
| Swagger UI | `/api-docs` | GET |

### Query Parameters for `GET /songs`
- `genre` – Filter by genre (e.g., `Pop`, `R&B`)
- `favorite` – Set to `true` to show only favorites
- `sortBy` – Sort column: `title`, `artist`, `duration`, `genre`, `createdAt`
- `order` – Sort direction: `asc` (default) or `desc`

---

## Design & Assumptions

- The application follows the **same architecture as the provided Todo template** (domain → service → DB context → DTO pattern).
- Data is stored in a **SQLite database** (`playlist.db`). On Vercel, it uses `/tmp/playlist.db`.
- The database is **auto-seeded** with 5 demo songs from the assignment screenshot on first run.
- Duration is stored in **seconds** internally and returned both as raw seconds and a formatted `"m:ss"` string.
- **No frontend** – only REST API endpoints with Swagger documentation.
- The `isFavorite` toggle endpoint (`PATCH /songs/:id/favorite`) flips the current favorite status.

## Issues Encountered

- SQLite on Vercel is ephemeral (resets on cold start) since `/tmp` is used. For production, a persistent database would be needed.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite3
- **Documentation:** Swagger UI (OpenAPI 3.0)

## Running Locally

```bash
cd apiNode
npm install
npm start
```

The API will be available at `http://localhost:3000` and Swagger UI at `http://localhost:3000/api-docs`.

---

## Links

| | |
|---|---|
| **Code** | https://github.com/cancolak900/playlist-api |
| **Deployment** | https://YOUR_DEPLOYMENT_URL |
