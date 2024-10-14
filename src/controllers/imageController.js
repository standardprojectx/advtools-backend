const path = require('path');
const imageService = require('../services/imageService');

exports.convertImageToPdf = async (req, reply) => {
  const files = req.files;
  try {
    const { uuid, filename } = await imageService.convertImagesToPdf(files);

   
    const downloadUrl = `/download/${uuid}/${filename}`;

 
    reply.send({ downloadUrl });
  } catch (error) {
    console.error('Erro ao converter imagem para PDF:', error);
    reply.status(500).send({ message: 'Erro ao converter imagem para PDF.' });
  }
};
