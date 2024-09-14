const imageService = require('../services/imageService');

exports.convertImageToPdf = async (req, reply) => {
  const files = req.files;

  try {
    const pdfBytes = await imageService.convertImagesToPdf(files);

    reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', 'attachment; filename="converted_file.pdf"')
      .send(pdfBytes); 
  } catch (error) {
    console.error('Erro ao converter imagem para PDF:', error);
    reply.status(500).send({ message: 'Erro ao converter imagem para PDF.' });
  }
};
