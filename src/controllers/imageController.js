
const imageService = require('../services/imageService');

exports.convertImageToPdf = async (req, res) => {
  const files = req.files;

  try {
    await imageService.convertImagesToPdf(files, res);
  } catch (error) {
    console.error('Erro ao converter imagem para PDF:', error);
    res.status(500).send({ message: 'Erro ao converter imagem para PDF.' });
  }
};
