const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class AlbumsService {
  constructor(cacheService, storageService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
    this._storageService = storageService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows[0];

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    return {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover,
      songs: songsResult.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addCoverToAlbum(id, file) {
    const albumQuery = {
      text: 'SELECT cover FROM albums WHERE id = $1',
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);
    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const oldCoverUrl = albumResult.rows[0].cover;

    const coverUrl = await this._storageService.writeFile(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    const updateQuery = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(updateQuery);
    if (!result.rows.length) {
      throw new InvariantError('Gagal memperbarui cover album');
    }

    if (oldCoverUrl) {
      await this._storageService.deleteFile(oldCoverUrl);
    }
  }

  async addLikeToAlbum(userId, albumId) {
    await this.getAlbumById(albumId);

    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      throw new ClientError('Anda sudah menyukai album ini', 400);
    }

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async deleteLikeFromAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal batal menyukai album. Like tidak ditemukan.');
    }

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikeCount(albumId) {
    try {
      const count = await this._cacheService.get(`album-likes:${albumId}`);
      return { count: parseInt(count, 10), fromCache: true };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(id) AS count FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const { count } = result.rows[0];

      await this._cacheService.set(`album-likes:${albumId}`, count, 1800);

      return { count: parseInt(count, 10), fromCache: false };
    }
  }
}

module.exports = AlbumsService;