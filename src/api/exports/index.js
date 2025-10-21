const ExportsHandler = require('./handler');
const routes = require('./routes');
const PlaylistsValidator = require('../../validator/playlists');

module.exports = (producerService, playlistsService) => {
  const handler = new ExportsHandler(
    producerService,
    playlistsService,
    PlaylistsValidator,
  );
  return routes(handler);
};