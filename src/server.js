require('dotenv').config();

const express = require('express');
const ClientError = require('./exceptions/ClientError');

// Albums
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');
const albumsRouter = require('./api/albums');

// Songs
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');
const songsRouter = require('./api/songs');

const init = async () => {
  const app = express();

  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  app.use(express.json());

  // Routes
  app.use('/albums', albumsRouter(albumsService, AlbumsValidator));
  app.use('/songs', songsRouter(songsService, SongsValidator));

  // Custom Error Handling Middleware
  app.use((error, req, res, next) => {
    if (error) {
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }
      // Server ERROR
      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
    return next();
  });

  // 404 Not Found Middleware for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Resource yang Anda minta tidak ditemukan',
    });
  });

  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 5000;

  app.listen(port, host, () => {
    console.log(`Server berjalan pada http://${host}:${port}`);
  });
};

init();