// src/server.js
require('dotenv').config();
const config = require('./utils/config'); // Impor config

const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path'); // Impor path
const ClientError = require('./exceptions/ClientError');

// --- Service Baru ---
const StorageService = require('./services/storage/StorageService');
const CacheService = require('./services/redis/CacheService');
const ProducerService = require('./services/rabbitmq/ProducerService');
// --- Akhir Service Baru ---

// Albums
const albumsRouter = require('./api/albums');
// Modifikasi constructor AlbumsService
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// Songs
const songsRouter = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// Users
const usersRouter = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// Authentications
const authenticationsRouter = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

// Collaborations
const CollaborationsService = require('./services/postgres/CollaborationsService');

// Playlists
const playlistsRouter = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// Exports
const exportsRouter = require('./api/exports');

const init = async () => {
  const app = express();
  const cacheService = new CacheService();
  const storageService = new StorageService();
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService(cacheService, storageService); 
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService(collaborationsService);

  app.use(express.json());

  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); 
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.accessTokenKey); 
      req.user = decoded; 
    } catch (error) {
    }
    return next();
  };

  app.use(authMiddleware);

  app.use(`/${config.storage.localUploadPath}`, express.static(path.join(__dirname, config.storage.localUploadPath)));

  // Routes
  app.use('/albums', albumsRouter(albumsService, AlbumsValidator, storageService));
  app.use('/songs', songsRouter(songsService, SongsValidator));
  app.use('/users', usersRouter(usersService, UsersValidator));
  app.use(
    '/authentications',
    authenticationsRouter(
      authenticationsService,
      usersService,
      TokenManager,
      AuthenticationsValidator,
    ),
  );
  app.use('/playlists', playlistsRouter(
    playlistsService,
    songsService,
    collaborationsService,
    usersService,
    PlaylistsValidator
  ));
  app.use('/export', exportsRouter(ProducerService, playlistsService));

  app.use((error, req, res, next) => {
    if (error) {
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }
      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
    return next();
  });

  const port = config.app.port || 5000;
  app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`);
  });
};

init();