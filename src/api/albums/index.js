const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = (service, validator, storageService) => {
  const albumsHandler = new AlbumsHandler(service, validator, storageService);
  return routes(albumsHandler);
};