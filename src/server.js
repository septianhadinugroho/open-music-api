require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const ClientError = require('./exceptions/ClientError');

// Albums
const albumsRouter = require('./api/albums');
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

const init = async () => {
  const app = express();

  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService(collaborationsService);

  app.use(express.json());

  // Middleware untuk autentikasi JWT
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Lanjutkan tanpa user jika tidak ada token
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
      req.user = decoded; // simpan payload token di request
    } catch (error) {
      // Abaikan token yang tidak valid, anggap sebagai non-authenticated
    }
    return next();
  };

  app.use(authMiddleware);

  // Routes
  app.use('/albums', albumsRouter(albumsService, AlbumsValidator));
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

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`);
  });
};

init();