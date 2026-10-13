const songDBContext = require("../db/songDBContext");
const Song = require("../domain/Song");

class SongService {
  /**
   * List songs with optional genre filter, favorites filter, and sorting.
   */
  async list({ genre, sortBy, order, favorite } = {}) {
    return songDBContext.listSongs({ genre, sortBy, order, favorite });
  }

  async get(id) {
    return songDBContext.getSongById(id);
  }

  /**
   * Search songs by keyword across title, artist, and genre.
   */
  async search(keyword) {
    const term = keyword.trim();
    return songDBContext.searchSongs(term);
  }

  /**
   * Create a new song.
   */
  async create({ title, artist, duration, genre, isFavorite }) {
    const song = new Song({
      title: title.trim(),
      artist: artist.trim(),
      duration,
      genre: genre ? genre.trim() : "Pop",
      isFavorite: Boolean(isFavorite),
      createdAt: new Date().toISOString(),
    });

    const result = await songDBContext.insertSong(song);
    return songDBContext.getSongById(result.lastID);
  }

  /**
   * Full replace of a song (PUT).
   */
  async replace(id, { title, artist, duration, genre, isFavorite }) {
    const song = new Song({
      id,
      title: title.trim(),
      artist: artist.trim(),
      duration,
      genre: genre ? genre.trim() : "Pop",
      isFavorite: Boolean(isFavorite),
      createdAt: new Date().toISOString(),
    });

    const result = await songDBContext.updateSong(id, song);
    if (result.changes === 0) return null;
    return songDBContext.getSongById(id);
  }

  /**
   * Partial update of a song (PATCH).
   */
  async update(id, { title, artist, duration, genre, isFavorite }) {
    const existing = await songDBContext.getSongById(id);
    if (!existing) return null;

    const song = new Song({
      id,
      title: title !== undefined ? title.trim() : existing.title,
      artist: artist !== undefined ? artist.trim() : existing.artist,
      duration: duration !== undefined ? duration : existing.duration,
      genre: genre !== undefined ? genre.trim() : existing.genre,
      isFavorite: isFavorite !== undefined ? Boolean(isFavorite) : existing.isFavorite,
      createdAt: existing.createdAt,
    });

    await songDBContext.updateSong(id, song);
    return songDBContext.getSongById(id);
  }

  /**
   * Toggle the favorite status of a song.
   */
  async toggleFavorite(id) {
    const existing = await songDBContext.getSongById(id);
    if (!existing) return null;

    const song = new Song({
      ...existing,
      isFavorite: !existing.isFavorite,
    });

    await songDBContext.updateSong(id, song);
    return songDBContext.getSongById(id);
  }

  async delete(id) {
    const existing = await songDBContext.getSongById(id);
    if (!existing) return null;

    await songDBContext.deleteSong(id);
    return existing;
  }

  /**
   * Get playlist summary stats.
   */
  async getStats() {
    const stats = await songDBContext.getPlaylistStats();
    const totalSeconds = stats.totalDuration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      totalSongs: stats.totalSongs,
      totalDuration: `${minutes} min ${seconds} sec`,
      totalDurationSeconds: totalSeconds,
    };
  }
}

module.exports = SongService;
