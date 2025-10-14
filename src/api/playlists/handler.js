const autoBind = require('auto-bind');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class PlaylistsHandler {
  // Tambahkan collaborationsService dan usersService di constructor
  constructor(playlistsService, songsService, collaborationsService, usersService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
    this._usersService = usersService; // Untuk memverifikasi userId
    this._validator = validator;
    autoBind(this);
  }

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
      // Gunakan verifyPlaylistOwner karena hanya pemilik yang boleh menghapus
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
      const userId = this._verifyUserAccess(req);
      this._validator.validatePostSongToPlaylistPayload(req.body);
      const { id: playlistId } = req.params;
      const { songId } = req.body;

      await this._songsService.getSongById(songId); // verifikasi lagu ada
      // Gunakan verifyPlaylistAccess
      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      await this._playlistsService.addSongToPlaylist(playlistId, songId);
      // Catat aktivitas
      await this._playlistsService.addPlaylistActivity(playlistId, songId, userId, 'add');

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
      const userId = this._verifyUserAccess(req);
      const { id: playlistId } = req.params;
      // Gunakan verifyPlaylistAccess
      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
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
      const userId = this._verifyUserAccess(req);
      const { id: playlistId } = req.params;
      const { songId } = req.body;
      // Gunakan verifyPlaylistAccess
      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);
      // Catat aktivitas
      await this._playlistsService.addPlaylistActivity(playlistId, songId, userId, 'delete');

      return res.status(200).json({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      });
    } catch (error) {
      return next(error);
    }
  }
  
  // Handler baru untuk kolaborasi
  async postCollaborationHandler(req, res, next) {
    try {
      this._validator.validatePostCollaborationPayload(req.body);
      const owner = this._verifyUserAccess(req);
      const { playlistId, userId } = req.body;

      // Verifikasi user yang akan diajak kolaborasi ada
      await this._usersService.getUserById(userId);
      // Hanya pemilik playlist yang bisa menambah kolaborator
      await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
      const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);
      
      return res.status(201).json({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
  
  async deleteCollaborationHandler(req, res, next) {
    try {
      this._validator.validatePostCollaborationPayload(req.body);
      const owner = this._verifyUserAccess(req);
      const { playlistId, userId } = req.body;
      
      await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return res.status(200).json({
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      });
    } catch (error) {
      return next(error);
    }
  }

  // Handler baru untuk aktivitas
  async getPlaylistActivitiesHandler(req, res, next) {
    try {
      const userId = this._verifyUserAccess(req);
      const { id: playlistId } = req.params;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      const activities = await this._playlistsService.getPlaylistActivities(playlistId);

      return res.status(200).json({
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = PlaylistsHandler;