const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = (playlistsService, songsService, collaborationsService, usersService, validator) => {
  const handler = new PlaylistsHandler(
    playlistsService,
    songsService,
    collaborationsService,
    usersService,
    validator,
  );
  return routes(handler);
};