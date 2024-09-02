const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });  // Configura o multer para salvar arquivos na pasta 'uploads/'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint para conversão de arquivos
app.post('/convert', upload.array('files'), async (req, res) => {
  const files = req.files;
  const conversionType = req.body.conversionType;

  try {
    if (conversionType === 'imageToPdf') {
      await convertImagesToPdf(files, res);
    } else if (conversionType === 'opusToOgg' || conversionType === 'webmToOgg' || conversionType === 'mp4ToWebm') {
      await convertAudioVideo(files, conversionType, res);
    } else if (conversionType === 'mergePdfs' || conversionType === 'splitPdf') {
      await handlePdfOperations(files, conversionType, res);
    } else {
      res.status(400).send({ message: 'Tipo de conversão inválido.' });
    }
  } catch (error) {
    console.error('Erro durante a conversão:', error);
    res.status(500).send({ message: 'Erro durante a conversão.' });
  }
});

const convertImagesToPdf = async (files, res) => {
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
  const outputPath = path.join('uploads', 'output.pdf');
  fs.writeFileSync(outputPath, pdfBytes);

  res.send({ message: 'Imagens convertidas para PDF com sucesso.', outputPath });
};

const convertAudioVideo = (files, conversionType, res) => {
  const outputFiles = [];

  files.forEach(file => {
    let outputPath;
    if (conversionType === 'opusToOgg') {
      outputPath = file.path.replace('.opus', '.ogg');
    } else if (conversionType === 'webmToOgg') {
      outputPath = file.path.replace('.webm', '.ogg');
    } else if (conversionType === 'mp4ToWebm') {
      outputPath = file.path.replace('.mp4', '.webm');
    }

    ffmpeg(file.path)
      .toFormat(conversionType.split('To')[1].toLowerCase())
      .on('end', () => {
        outputFiles.push(outputPath);
        if (outputFiles.length === files.length) {
          res.send({ message: 'Conversão de áudio/vídeo realizada com sucesso.', outputFiles });
        }
      })
      .on('error', (err) => {
        console.error('Erro ao converter arquivo:', err);
        res.status(500).send({ message: 'Erro ao converter arquivos.' });
      })
      .save(outputPath);
  });
};

const handlePdfOperations = async (files, conversionType, res) => {
  if (conversionType === 'mergePdfs') {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const outputPath = path.join('uploads', 'merged.pdf');
    fs.writeFileSync(outputPath, mergedPdfBytes);
    res.send({ message: 'PDFs unidos com sucesso.', outputPath });
  } else if (conversionType === 'splitPdf') {
    const pdfBytes = fs.readFileSync(files[0].path);
    const pdf = await PDFDocument.load(pdfBytes);
    const outputFiles = [];

    for (let i = 0; i < pdf.getPageCount(); i++) {
      const singlePagePdf = await PDFDocument.create();
      const [copiedPage] = await singlePagePdf.copyPages(pdf, [i]);
      singlePagePdf.addPage(copiedPage);
      const singlePageBytes = await singlePagePdf.save();
      const outputPath = path.join('uploads', `page_${i + 1}.pdf`);
      fs.writeFileSync(outputPath, singlePageBytes);
      outputFiles.push(outputPath);
    }

    res.send({ message: 'PDF dividido com sucesso.', outputFiles });
  }
};

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});

