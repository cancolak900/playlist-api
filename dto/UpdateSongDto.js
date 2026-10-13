const DtoValidationError = require("./DtoValidationError");

class UpdateSongDto {
  constructor({ title, artist, duration, genre, isFavorite }) {
    this.title = title;
    this.artist = artist;
    this.duration = duration;
    this.genre = genre;
    this.isFavorite = isFavorite;
  }

  /**
   * PUT – all fields required for full replace.
   */
  static fromPutRequest(body) {
    const { title, artist, duration, genre, isFavorite } = body ?? {};

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
      throw new DtoValidationError("Field 'genre' is required and must be a non-empty string");
    }
    if (typeof isFavorite !== "boolean") {
      throw new DtoValidationError("Field 'isFavorite' is required and must be a boolean");
    }

    return new UpdateSongDto({
      title: title.trim(),
      artist: artist.trim(),
      duration,
      genre: genre.trim(),
      isFavorite,
    });
  }

  /**
   * PATCH – partial update, only provided fields are validated.
   */
  static fromPatchRequest(body) {
    const { title, artist, duration, genre, isFavorite } = body ?? {};

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      throw new DtoValidationError("Field 'title' must be a non-empty string");
    }
    if (artist !== undefined && (typeof artist !== "string" || artist.trim() === "")) {
      throw new DtoValidationError("Field 'artist' must be a non-empty string");
    }
    if (duration !== undefined && (typeof duration !== "number" || !Number.isInteger(duration) || duration <= 0)) {
      throw new DtoValidationError("Field 'duration' must be a positive integer (seconds)");
    }
    if (genre !== undefined && (typeof genre !== "string" || genre.trim() === "")) {
      throw new DtoValidationError("Field 'genre' must be a non-empty string");
    }
    if (isFavorite !== undefined && typeof isFavorite !== "boolean") {
      throw new DtoValidationError("Field 'isFavorite' must be a boolean");
    }

    return new UpdateSongDto({
      title: title !== undefined ? title.trim() : undefined,
      artist: artist !== undefined ? artist.trim() : undefined,
      duration,
      genre: genre !== undefined ? genre.trim() : undefined,
      isFavorite,
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

module.exports = UpdateSongDto;
