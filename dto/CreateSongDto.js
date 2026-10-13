const DtoValidationError = require("./DtoValidationError");

class CreateSongDto {
  constructor({ title, artist, duration, genre, isFavorite }) {
    this.title = title;
    this.artist = artist;
    this.duration = duration;
    this.genre = genre;
    this.isFavorite = isFavorite;
  }

  static fromRequest(body) {
    const { title, artist, duration, genre = "Pop", isFavorite = false } = body ?? {};

    if (typeof title !== "string" || title.trim() === "") {
      throw new DtoValidationError("Field 'title' is required and must be a non-empty string");
    }

    if (typeof artist !== "string" || artist.trim() === "") {
      throw new DtoValidationError("Field 'artist' is required and must be a non-empty string");
    }

    if (typeof duration !== "number" || !Number.isInteger(duration) || duration <= 0) {
      throw new DtoValidationError("Field 'duration' is required and must be a positive integer (seconds)");
    }

    if (typeof genre !== "string" || genre.trim() === "") {
      throw new DtoValidationError("Field 'genre' must be a non-empty string");
    }

    return new CreateSongDto({
      title: title.trim(),
      artist: artist.trim(),
      duration,
      genre: genre.trim(),
      isFavorite: Boolean(isFavorite),
    });
  }

  toServiceInput() {
    return {
      title: this.title,
      artist: this.artist,
      duration: this.duration,
      genre: this.genre,
      isFavorite: this.isFavorite,
    };
  }
}

module.exports = CreateSongDto;
