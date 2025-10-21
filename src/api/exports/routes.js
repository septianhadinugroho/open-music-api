const express = require('express');

const routes = (handler) => {
  const router = express.Router();

  router.post('/playlists/:playlistId', handler.postExportPlaylistHandler);

  return router;
};

module.exports = routes;