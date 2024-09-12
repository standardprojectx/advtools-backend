const pdfService = require('../services/pdfService');

exports.handlePdfOperations = async (req, res) => {
  const files = req.files;
  const conversionType = req.body.conversionType;

  try {
    await pdfService.handlePdfOperations(files, conversionType, res);
  } catch (error) {
    console.error('Erro ao manipular PDF:', error);
    res.status(500).send({ message: 'Erro ao manipular PDF.' });
  }
};
