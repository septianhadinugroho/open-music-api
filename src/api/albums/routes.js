const express = require('express');
const multer = require('multer'); 
const InvariantError = require('../../exceptions/InvariantError');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 512000, // Ukuran maks 512000 Bytes
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/apng', 'image/avif', 'image/svg+xml'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new InvariantError('File type not allowed. Only images are permitted.'), false);
    }
  },
});

const routes = (handler) => {
  const router = express.Router();

  router.post('/', handler.postAlbumHandler);
  router.get('/:id', handler.getAlbumByIdHandler);
  router.put('/:id', handler.putAlbumByIdHandler);
  router.delete('/:id', handler.deleteAlbumByIdHandler);

  router.post('/:id/covers', upload.single('cover'), handler.postAlbumCoverHandler);

  router.post('/:id/likes', handler.postAlbumLikeHandler);
  router.delete('/:id/likes', handler.deleteAlbumLikeHandler);
  router.get('/:id/likes', handler.getAlbumLikesHandler);

  return router;
};

module.exports = routes;