class SongDto {
  static fromDomain(song) {
    if (!song) return null;
    const minutes = Math.floor(song.duration / 60);
    const seconds = song.duration % 60;
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      durationFormatted: `${minutes}:${seconds.toString().padStart(2, "0")}`,
      genre: song.genre,
      isFavorite: Boolean(song.isFavorite),
    };
  }

  static fromDomainList(songs) {
    return songs.map(SongDto.fromDomain);
  }
}

module.exports = SongDto;
