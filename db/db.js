const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Vercel's application directory is read-only; demo data lives in temporary storage.
const DB_PATH = process.env.VERCEL
  ? "/tmp/playlist.db"
  : path.join(__dirname, "..", "playlist.db");
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      duration INTEGER NOT NULL,
      genre TEXT NOT NULL DEFAULT 'Pop',
      isFavorite INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    )`
  );

  // Seed with demo data from the screenshot if the table is empty
  db.get("SELECT COUNT(*) AS count FROM songs", (err, row) => {
    if (err) return;
    if (row.count === 0) {
      const seedSongs = [
        { title: "Blinding Lights", artist: "The Weeknd", duration: 212, genre: "Pop", isFavorite: 1 },
        { title: "Levitating", artist: "Dua Lipa", duration: 220, genre: "Pop", isFavorite: 0 },
        { title: "Watermelon Sugar", artist: "Harry Styles", duration: 214, genre: "Pop", isFavorite: 1 },
        { title: "Save Your Tears", artist: "The Weeknd", duration: 246, genre: "R&B", isFavorite: 0 },
        { title: "Peaches", artist: "Justin Bieber", duration: 154, genre: "Pop", isFavorite: 1 },
      ];

      const stmt = db.prepare(
        "INSERT INTO songs (title, artist, duration, genre, isFavorite, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
      );
      const now = new Date().toISOString();
      for (const s of seedSongs) {
        stmt.run(s.title, s.artist, s.duration, s.genre, s.isFavorite, now);
      }
      stmt.finalize();
      console.log("Seeded 5 demo songs into the playlist.");
    }
  });
});

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

module.exports = {
  db,
  runAsync,
  getAsync,
  allAsync,
};
