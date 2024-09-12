
const upload = require('../utils/upload');
const pdfController = require('../controllers/pdfController');

async function pdfRoutes(fastify, options) {
  fastify.post('/convert/pdf', { preHandler: upload.array('files') }, pdfController.handlePdfOperations);
}

module.exports = pdfRoutes;
