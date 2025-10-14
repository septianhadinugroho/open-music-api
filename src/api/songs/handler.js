const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postSongHandler(req, res, next) {
    try {
      this._validator.validateSongPayload(req.body);
      const songId = await this._service.addSong(req.body);
      return res.status(201).json({
        status: 'success',
        data: {
          songId,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSongsHandler(req, res, next) {
    try {
      const { title, performer } = req.query;
      const songs = await this._service.getSongs({ title, performer });
      return res.status(200).json({
        status: 'success',
        data: {
          songs,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSongByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const song = await this._service.getSongById(id);
      return res.status(200).json({
        status: 'success',
        data: {
          song,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async putSongByIdHandler(req, res, next) {
    try {
      this._validator.validateSongPayload(req.body);
      const { id } = req.params;
      await this._service.editSongById(id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteSongByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteSongById(id);
      return res.status(200).json({
        status: 'success',
        message: 'Lagu berhasil dihapus',
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = SongsHandler;