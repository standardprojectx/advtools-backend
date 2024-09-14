
const pdfController = require('../controllers/pdfController');

async function pdfRoutes(fastify, options) {
  fastify.post('/convert/pdf', { preHandler: fastify.array('files') }, pdfController.handlePdfOperations);
}

module.exports = pdfRoutes;
