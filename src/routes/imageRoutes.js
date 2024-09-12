const upload = require('../utils/upload');
const imageController = require('../controllers/imageController');

async function imageRoutes(fastify, options) {
  fastify.post('/convert/image', { preHandler: upload.array('files') }, imageController.convertImageToPdf);
}

module.exports = imageRoutes;
