const autoBind = require('auto-bind');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class AlbumsHandler {
  constructor(service, validator, storageService) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    autoBind(this);
  }

  _verifyUserAccess(request) {
    if (!request.user) {
      throw new AuthenticationError('Anda harus login untuk mengakses resource ini');
    }
    return request.user.id;
  }

  async postAlbumHandler(req, res, next) {
    try {
      this._validator.validateAlbumPayload(req.body);
      const { name, year } = req.body;
      const albumId = await this._service.addAlbum({ name, year });
      return res.status(201).json({
        status: 'success',
        data: {
          albumId,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getAlbumByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const album = await this._service.getAlbumById(id);
      return res.status(200).json({
        status: 'success',
        data: {
          album,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async putAlbumByIdHandler(req, res, next) {
    try {
      this._validator.validateAlbumPayload(req.body);
      const { id } = req.params;
      await this._service.editAlbumById(id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Album berhasil diperbarui',
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteAlbumByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteAlbumById(id);
      return res.status(200).json({
        status: 'success',
        message: 'Album berhasil dihapus',
      });
    } catch (error) {
      return next(error);
    }
  }

  async postAlbumCoverHandler(req, res, next) {
    try {
      const { id: albumId } = req.params;
      const { file } = req;

      if (!file) {
        throw new ClientError('Tidak ada file yang diunggah', 400);
      }
      
      if (file.size > 512000) {
        throw new InvariantError('Ukuran file terlalu besar, maks 512KB');
      }

      await this._service.addCoverToAlbum(albumId, file);

      return res.status(201).json({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
    } catch (error) {
      return next(error);
    }
  }

  async postAlbumLikeHandler(req, res, next) {
    try {
      const userId = this._verifyUserAccess(req);
      const { id: albumId } = req.params;

      await this._service.addLikeToAlbum(userId, albumId);

      return res.status(201).json({
        status: 'success',
        message: 'Berhasil menyukai album',
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteAlbumLikeHandler(req, res, next) {
    try {
      const userId = this._verifyUserAccess(req);
      const { id: albumId } = req.params;

      await this._service.deleteLikeFromAlbum(userId, albumId);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil batal menyukai album',
      });
    } catch (error) {
      return next(error);
    }
  }

  async getAlbumLikesHandler(req, res, next) {
    try {
      const { id: albumId } = req.params;
      const { count, fromCache } = await this._service.getAlbumLikeCount(albumId);

      if (fromCache) {
        res.setHeader('X-Data-Source', 'cache');
      }

      return res.status(200).json({
        status: 'success',
        data: {
          likes: count,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AlbumsHandler;