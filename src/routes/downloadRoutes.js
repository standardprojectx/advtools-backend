const fs = require('fs');
const path = require('path');

async function downloadRoutes(fastify, options) {
  fastify.get('/download/:uuid/:filename', async (req, reply) => {
    const { uuid, filename } = req.params;

    const filePath = path.join('tmp', uuid, filename);

    // Verifica se o arquivo existe
    if (fs.existsSync(filePath)) {
      // Define os cabeçalhos apropriados
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);

      const stream = fs.createReadStream(filePath);
      return reply.send(stream);
    } else {
      reply.status(404).send({ message: 'Arquivo não encontrado' });
    }
  });
}

module.exports = downloadRoutes;
