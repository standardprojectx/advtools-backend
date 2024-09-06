const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const upload = multer({ dest: '/tmp/uploads/' });

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Hello World AdvTools Backend' });
});

app.get('/home', (req, res) => {
  res.json({ message: 'Hello World AdvTools Backend Homeee' });
});

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

// Função para gerar nomes de arquivos aleatórios
const generateRandomFileName = (originalName) => {
  const token = jwt.sign({ data: originalName }, 'secret', { expiresIn: '1h' });
  const extension = path.extname(originalName);
  return `${token}${extension}`;
};

// Conversão de áudio/vídeo usando `ffmpeg.wasm` com import dinâmico
const convertAudioVideo = async (files, conversionType, res) => {
  const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg'); // Importação dinâmica do ffmpeg

  const ffmpeg = createFFmpeg({ log: true });

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  const inputFile = files[0].path; // Considerando que há um arquivo por vez
  const fileName = path.basename(inputFile);

  ffmpeg.FS('writeFile', fileName, await fetchFile(files[0].path)); // Lê o arquivo para o fs virtual do ffmpeg

  let outputFile;
  if (conversionType === 'opusToOgg') {
    outputFile = 'output.ogg';
    await ffmpeg.run('-i', fileName, outputFile);
  } else if (conversionType === 'mp4ToWebm') {
    outputFile = 'output.webm';
    await ffmpeg.run('-i', fileName, outputFile);
  }

  const data = ffmpeg.FS('readFile', outputFile); // Lê o arquivo convertido do fs virtual

  const outputPath = path.join('/tmp', outputFile); // Caminho temporário para salvar o arquivo convertido
  fs.writeFileSync(outputPath, Buffer.from(data)); // Salva o arquivo convertido no sistema

  res.download(outputPath, outputFile, (err) => {
    if (err) {
      console.error('Erro ao enviar o arquivo:', err);
      res.status(500).send({ message: 'Erro ao enviar o arquivo.' });
    }
    fs.unlinkSync(outputPath); // Remove o arquivo após o download
  });
};

// Outras funções de manipulação de PDF
const convertImagesToPdf = async (files, res) => {
  const { PDFDocument } = await import('pdf-lib'); // Importação dinâmica do pdf-lib

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

const handlePdfOperations = async (files, conversionType, res) => {
  const { PDFDocument } = await import('pdf-lib'); // Importação dinâmica do pdf-lib

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
  } else if (conversionType === 'splitPdf') {
    const pdfBytes = fs.readFileSync(files[0].path);
    const pdf = await PDFDocument.load(pdfBytes);
    const outputFiles = [];

    for (let i = 0; i < pdf.getPageCount(); i++) {
      const singlePagePdf = await PDFDocument.create();
      const [copiedPage] = await singlePagePdf.copyPages(pdf, [i]);
      singlePagePdf.addPage(copiedPage);
      const singlePageBytes = await singlePagePdf.save();
      const randomFileName = generateRandomFileName(`page_${i + 1}.pdf`);
      const outputPath = path.join('/tmp', randomFileName);
      fs.writeFileSync(outputPath, singlePageBytes);
      outputFiles.push(outputPath);

      res.download(outputPath, randomFileName, (err) => {
        if (err) {
          console.error('Erro ao enviar o arquivo:', err);
          res.status(500).send({ message: 'Erro ao enviar o arquivo.' });
        }
        fs.unlinkSync(outputPath);
        files.forEach(file => fs.unlinkSync(file.path));
      });
    }
  }
};

// Iniciar o servidor
app.listen(4000, () => {
  console.log('Servidor rodando na porta 4000');
});
