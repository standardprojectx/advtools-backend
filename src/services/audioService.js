const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { generateRandomFileName } = require('../utils/fileUtils');

exports.convertAudioVideo = (files, conversionType, res) => {
  const outputFiles = [];

  files.forEach(file => {
    const randomFileName = generateRandomFileName(file.originalname);
    const outputPath = path.join('/tmp', randomFileName);

    ffmpeg(file.path)
      .toFormat(conversionType.split('To')[1].toLowerCase())
      .on('end', () => {
        outputFiles.push(outputPath);
        if (outputFiles.length === files.length) {
          res.download(outputPath, randomFileName, (err) => {
            if (err) {
              console.error('Erro ao enviar o arquivo:', err);
              res.status(500).send({ message: 'Erro ao enviar o arquivo.' });
            }
            fs.unlinkSync(outputPath);
            files.forEach(file => fs.unlinkSync(file.path));
          });
        }
      })
      .on('error', (err) => {
        console.error('Erro ao converter arquivo:', err);
        res.status(500).send({ message: 'Erro ao converter arquivos.' });
      })
      .save(outputPath);
  });
};
