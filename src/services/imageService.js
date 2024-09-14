
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

exports.convertImagesToPdf = async (files) => {
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

  
    fs.unlinkSync(file.path);
  }

  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};
