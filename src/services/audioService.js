const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { generateRandomFileName } = require('../utils/utils');
const archiver = require('archiver');

exports.convertAudioVideo = async (files, conversionType) => {
  const outputFiles = [];

  const conversionPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const outputExtension = conversionType.split('To')[1].toLowerCase();
      const baseName = path.parse(file.originalname).name;
      const randomFileName = generateRandomFileName(`${baseName}.${outputExtension}`);
      const outputPath = path.join('/tmp', randomFileName);

      ffmpeg(file.path)
        .toFormat(outputExtension)
        .on('end', () => {
          fs.stat(outputPath, (err, stats) => {
            if (err) {
              console.error(`Erro ao acessar o arquivo convertido: ${outputPath}`, err);
            } else {
              console.log(`Arquivo convertido: ${outputPath}, tamanho: ${stats.size} bytes`);
            }
          });
          // Remover o arquivo de entrada
          fs.unlinkSync(file.path);
          // Adicionar o arquivo de saída à lista
          outputFiles.push({ path: outputPath, name: randomFileName });
          resolve();
        })        
        .on('error', (err) => {
          console.error('Erro ao converter arquivo:', err);
          fs.unlinkSync(file.path);
          reject(err);
        })
        .save(outputPath);
    });
  });

  await Promise.all(conversionPromises);

  if (outputFiles.length === 1) {
    // Apenas um arquivo, retornar diretamente
    const outputFile = outputFiles[0];
    return { type: 'single', file: outputFile };
  } else {
    // Múltiplos arquivos, criar um zip
    const zipFileName = generateRandomFileName('converted_files.zip');
    const zipFilePath = path.join('/tmp', zipFileName);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        // Remover os arquivos de saída individuais
        outputFiles.forEach(file => fs.unlinkSync(file.path));
        resolve({ type: 'zip', path: zipFilePath, name: zipFileName });
      });

      archive.on('error', (err) => {
        console.error('Erro ao criar o arquivo zip:', err);
        outputFiles.forEach(file => fs.unlinkSync(file.path));
        reject(err);
      });

      archive.pipe(output);

      outputFiles.forEach(file => {
        archive.file(file.path, { name: file.name });
      });

      archive.finalize();
    });
  }
};
