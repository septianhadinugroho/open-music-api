const express = require('express');

const routes = (handler) => {
  const router = express.Router();

  router.post('/', handler.postPlaylistHandler);
  router.get('/', handler.getPlaylistsHandler);
  router.delete('/:id', handler.deletePlaylistByIdHandler);

  router.post('/:id/songs', handler.postSongToPlaylistHandler);
  router.get('/:id/songs', handler.getSongsFromPlaylistHandler);
  router.delete('/:id/songs', handler.deleteSongFromPlaylistHandler);

  // Rute baru untuk kolaborasi
  router.post('/collaborations', handler.postCollaborationHandler);
  router.delete('/collaborations', handler.deleteCollaborationHandler);

  // Rute baru untuk aktivitas
  router.get('/:id/activities', handler.getPlaylistActivitiesHandler);

  return router;
};

module.exports = routes;