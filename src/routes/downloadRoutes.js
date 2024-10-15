const fs = require('fs');
const path = require('path');

async function downloadRoutes(fastify, options) {
  fastify.get('/download/:uuid/:filename', async (req, reply) => {
    const { uuid, filename } = req.params;

    const filePath = path.join('tmp', uuid, filename);

    // Verifica se o arquivo existe
    if (fs.existsSync(filePath)) {
      // Determina o tipo de conteúdo com base na extensão do arquivo
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';

      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.zip') {
        contentType = 'application/zip';
      } else if (ext === '.mp3') {
        contentType = 'audio/mpeg';
      } else if (ext === '.ogg') {
        contentType = 'audio/ogg';
      } else if (ext === '.wav') {
        contentType = 'audio/wav';
      } else if (ext === '.mp4') {
        contentType = 'video/mp4';
      }
      // Adicione outros tipos conforme necessário

      // Define os cabeçalhos apropriados
      reply.header('Content-Type', contentType);
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);

      const stream = fs.createReadStream(filePath);
      return reply.send(stream);
    } else {
      reply.status(404).send({ message: 'Arquivo não encontrado' });
    }
  });
}

module.exports = downloadRoutes;
