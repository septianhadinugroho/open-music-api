const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const PostCollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

const ExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  PostCollaborationPayloadSchema,
  ExportPlaylistPayloadSchema,
};