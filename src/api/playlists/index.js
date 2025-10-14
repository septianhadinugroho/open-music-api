const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = (playlistsService, songsService, validator) => {
  const handler = new PlaylistsHandler(playlistsService, songsService, validator);
  return routes(handler);
};