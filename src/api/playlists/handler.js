const autoBind = require('auto-bind');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
    autoBind(this);
  }

  // Fungsi untuk memeriksa otentikasi di awal setiap handler
  _verifyUserAccess(request) {
    if (!request.user) {
      throw new AuthenticationError('Anda harus login untuk mengakses resource ini');
    }
    return request.user.id;
  }

  async postPlaylistHandler(req, res, next) {
    try {
      const owner = this._verifyUserAccess(req);
      this._validator.validatePostPlaylistPayload(req.body);
      const { name } = req.body;

      const playlistId = await this._playlistsService.addPlaylist({ name, owner });

      return res.status(201).json({
        status: 'success',
        data: {
          playlistId,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getPlaylistsHandler(req, res, next) {
    try {
      const owner = this._verifyUserAccess(req);
      const playlists = await this._playlistsService.getPlaylists(owner);
      return res.status(200).json({
        status: 'success',
        data: {
          playlists,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async deletePlaylistByIdHandler(req, res, next) {
    try {
      const owner = this._verifyUserAccess(req);
      const { id: playlistId } = req.params;

      await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
      await this._playlistsService.deletePlaylistById(playlistId);

      return res.status(200).json({
        status: 'success',
        message: 'Playlist berhasil dihapus',
      });
    } catch (error) {
      return next(error);
    }
  }

  async postSongToPlaylistHandler(req, res, next) {
    try {
      const owner = this._verifyUserAccess(req);
      this._validator.validatePostSongToPlaylistPayload(req.body);
      const { id: playlistId } = req.params;
      const { songId } = req.body;

      await this._playlistsService.verifySongId(songId);
      await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
      await this._playlistsService.addSongToPlaylist(playlistId, songId);

      return res.status(201).json({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSongsFromPlaylistHandler(req, res, next) {
    try {
      const owner = this._verifyUserAccess(req);
      const { id: playlistId } = req.params;

      await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
      const playlist = await this._playlistsService.getSongsFromPlaylist(playlistId);

      return res.status(200).json({
        status: 'success',
        data: {
          playlist,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteSongFromPlaylistHandler(req, res, next) {
    try {
      const owner = this._verifyUserAccess(req);
      const { id: playlistId } = req.params;
      const { songId } = req.body;

      await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
      await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

      return res.status(200).json({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = PlaylistsHandler;