const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { generateRandomFileName } = require('../utils/fileUtils');

exports.handlePdfOperations = async (files, conversionType, res) => {
  if (conversionType === 'mergePdfs') {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const randomFileName = generateRandomFileName('merged.pdf');
    const outputPath = path.join('/tmp', randomFileName);
    fs.writeFileSync(outputPath, mergedPdfBytes);

    res.download(outputPath, randomFileName, (err) => {
      if (err) {
        console.error('Erro ao enviar o arquivo:', err);
        res.status(500).send({ message: 'Erro ao enviar o arquivo.' });
      }
      fs.unlinkSync(outputPath);
      files.forEach(file => fs.unlinkSync(file.path));
    });
  }
  // Lógica para splitPdf também pode ser adicionada aqui
};
