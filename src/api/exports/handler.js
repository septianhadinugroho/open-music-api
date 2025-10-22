const autoBind = require('auto-bind');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    autoBind(this);
  }

  _verifyUserAccess(request) {
    if (!request.user) {
      throw new AuthenticationError('Anda harus login untuk mengakses resource ini');
    }
    return request.user.id;
  }

  async postExportPlaylistHandler(req, res, next) {
    try {
      const userId = this._verifyUserAccess(req);

      this._validator.validateExportPlaylistPayload(req.body);
      
      const { playlistId } = req.params;
      const { targetEmail } = req.body;

      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

      const message = {
        playlistId,
        targetEmail,
      };

      await this._producerService.sendMessage(
        'export:playlists',
        JSON.stringify(message),
      );

      return res.status(201).json({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ExportsHandler;