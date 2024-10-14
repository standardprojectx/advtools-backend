const audioService = require('../services/audioService');
const fs = require('fs');
const path = require('path');

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
      if (fs.existsSync(result.file.path)) {

        const fileBuffer = fs.readFileSync(result.file.path);
        const stat = fs.statSync(result.file.path);
        reply
          .header('Content-Type', 'application/ogg')
          .header('Content-Disposition', `attachment; filename="${result.file.name}"`)
          .header('Content-Length', stat.size)
          .send(fileBuffer);
      } else {
        console.error(`Arquivo não encontrado: ${result.file.path}`);
        reply.status(500).send({ message: 'Arquivo não encontrado após conversão.' });
      }
    } else if (result.type === 'zip') {
      if (fs.existsSync(result.path)) {
 
        const fileBuffer = fs.readFileSync(result.path);
        const stat = fs.statSync(result.path);
        reply
          .header('Content-Type', 'application/zip')
          .header('Content-Disposition', `attachment; filename="${result.name}"`)
          .header('Content-Length', stat.size)
          .send(fileBuffer);      
      } else {
        console.error(`Arquivo zip não encontrado: ${result.path}`);
        reply.status(500).send({ message: 'Arquivo zip não encontrado após conversão.' });
      }
    }
  } catch (error) {
    console.error('Erro ao converter áudio:', error);
    reply.status(500).send({ message: 'Erro ao converter áudio.' });
  }
};
