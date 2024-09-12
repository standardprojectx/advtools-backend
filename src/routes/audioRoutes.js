const upload = require('../utils/upload');
const audioController = require('../controllers/audioController');

async function audioRoutes(fastify, options) {
  fastify.post('/convert/audio', { preHandler: upload.array('files') }, audioController.convertAudio);
}

module.exports = audioRoutes;
