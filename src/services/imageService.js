const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { generateRandomFileName } = require('../utils/fileUtils');

exports.convertImagesToPdf = async (files, res) => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const imageBytes = fs.readFileSync(file.path);
    let image;

    try {
      image = await pdfDoc.embedJpg(imageBytes);
    } catch (error) {
      image = await pdfDoc.embedPng(imageBytes);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const randomFileName = generateRandomFileName('output.pdf');
  const outputPath = path.join('/tmp', randomFileName);
  fs.writeFileSync(outputPath, pdfBytes);

  res.download(outputPath, randomFileName, (err) => {
    if (err) {
      console.error('Erro ao enviar o arquivo:', err);
      res.status(500).send({ message: 'Erro ao enviar o arquivo.' });
    }
    fs.unlinkSync(outputPath);
    files.forEach(file => fs.unlinkSync(file.path));
  });
};
