const uploads = require('../uploads/uploads');
const imageController = require('../controllers/imageController');

async function imageRoutes(fastify, options) {
  fastify.post('/convert/image', { preHandler: uploads.array('files') }, imageController.convertImageToPdf);
}

module.exports = imageRoutes;
