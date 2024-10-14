const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

 
  const uuid = uuidv4();


  const tmpDir = path.join('tmp', uuid);
  fs.mkdirSync(tmpDir, { recursive: true });


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


  const pdfPath = path.join(tmpDir, newFileName);
  fs.writeFileSync(pdfPath, pdfBytes);


  return { uuid, filename: newFileName };
};
