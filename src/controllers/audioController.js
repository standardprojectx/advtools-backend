const audioService = require('../services/audioService');
const fs = require('fs');

exports.convertAudio = async (req, reply) => {
  const files = req.files;
  const conversionType = req.body.conversionType;

  try {
    const result = await audioService.convertAudioVideo(files, conversionType);

    const cleanup = () => {
      if (result.type === 'single') {
        fs.unlinkSync(result.file.path);
      } else if (result.type === 'zip') {
        fs.unlinkSync(result.path);
      }
    };

    reply.raw.on('finish', cleanup);

    if (result.type === 'single') {
      // Verifique se o arquivo existe
      if (fs.existsSync(result.file.path)) {
        reply
        .header('Content-Type', 'application/octet-stream')
        .header('Content-Disposition', `attachment; filename="${result.file.name}"`)
        .send(fs.createReadStream(result.file.path));      
      } else {
        reply.status(500).send({ message: 'Arquivo não encontrado após conversão.' });
      }
    } else if (result.type === 'zip') {
      if (fs.existsSync(result.path)) {
        reply
        .header('Content-Type', 'application/zip')
        .header('Content-Disposition', `attachment; filename="${result.name}"`)
        .send(fs.createReadStream(result.path));      
      } else {
        reply.status(500).send({ message: 'Arquivo zip não encontrado após conversão.' });
      }
    }
  } catch (error) {
    console.error('Erro ao converter áudio:', error);
    reply.status(500).send({ message: 'Erro ao converter áudio.' });
  }
};
