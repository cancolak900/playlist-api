class Song {
  constructor({ id = null, title, artist, duration, genre, isFavorite = false, createdAt }) {
    this.id = id;
    this.title = title;
    this.artist = artist;
    this.duration = duration;       // duration in seconds (e.g. 212 for 3:32)
    this.genre = genre;
    this.isFavorite = Boolean(isFavorite);
    this.createdAt = createdAt;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Song({
      id: row.id,
      title: row.title,
      artist: row.artist,
      duration: row.duration,
      genre: row.genre,
      isFavorite: row.isFavorite,
      createdAt: row.createdAt,
    });
  }

  toDbValues() {
    return {
      title: this.title,
      artist: this.artist,
      duration: this.duration,
      genre: this.genre,
      isFavorite: this.isFavorite ? 1 : 0,
      createdAt: this.createdAt,
    };
  }

  /**
   * Returns duration formatted as "m:ss" (e.g. "3:32")
   */
  get durationFormatted() {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

module.exports = Song;
