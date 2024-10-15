const imageController = require('../controllers/imageController');

async function imageRoutes(fastify, options) {
  fastify.post('/convert/image', {
    preValidation: fastify.uploads.array('files')
  }, imageController.convertImageToPdf);
}

module.exports = imageRoutes;
