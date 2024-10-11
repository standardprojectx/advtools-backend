const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

exports.convertAudioVideo = async (files, conversionType) => {
  const outputFiles = [];
  
  const conversionPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const outputExtension = conversionType.split('To')[1].toLowerCase();
      const baseName = path.parse(file.originalname).name;
      const outputFileName = `${baseName}_converted.${outputExtension}`;
      const outputPath = path.join('/tmp', outputFileName);

      ffmpeg(file.path)
        .toFormat(outputExtension)
        .on('end', () => {
          fs.stat(outputPath, (err, stats) => {
            if (!err) {
              console.log(`Arquivo convertido: ${outputPath}, tamanho: ${stats.size} bytes`);
            }
          });
          fs.unlinkSync(file.path);
          outputFiles.push({ path: outputPath, name: outputFileName });
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
    console.log("teste")
    const outputFile = outputFiles[0];
    console.log(outputFile)
    return { type: 'single', file: outputFile };
  } else {
    const names = outputFiles.map(file => path.parse(file.name).name);
    const concatenatedNames = names.join('_');
    const zipFileName = `${concatenatedNames}_converted.zip`;
    const zipFilePath = path.join('/tmp', zipFileName);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
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
