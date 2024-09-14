const audioController = require('../controllers/audioController');

async function audioRoutes(fastify, options) {
  fastify.post('/convert/audio', { preHandler: fastify.uploads.array('files') }, audioController.convertAudio);
}

module.exports = audioRoutes;