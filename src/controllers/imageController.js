const path = require('path');
const imageService = require('../services/imageService');

exports.convertImageToPdf = async (req, reply) => {
  const files = req.files;
  try {
    const pdfBytes = await imageService.convertImagesToPdf(files);
    let newFileName;
    if (Array.isArray(files)) {
      const names = files.map(file => path.parse(file.originalname).name);
      newFileName = `${names.join('_')}_converted.pdf`;
    } else if (files && files.originalname) {
      const nameWithoutExt = path.parse(files.originalname).name;
      newFileName = `${nameWithoutExt}_converted.pdf`;
    } else {
      newFileName = 'converted_file.pdf';
    }
    reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${newFileName}"`)
      .send(pdfBytes);
  } catch (error) {
    console.error('Erro ao converter imagem para PDF:', error);
    reply.status(500).send({ message: 'Erro ao converter imagem para PDF.' });
  }
};
