const uploads = require('../uploads/uploads');
const audioController = require('../controllers/audioController');

async function audioRoutes(fastify, options) {
  fastify.post('/convert/audio', { preHandler: uploads.array('files') }, audioController.convertAudio);
}

module.exports = audioRoutes;
