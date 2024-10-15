const audioService = require('../services/audioService');

exports.convertAudio = async (req, reply) => {
  const files = req.files;
  const conversionType = req.body.conversionType;

  try {
    const result = await audioService.convertAudio(files, conversionType);

    let downloadUrl;

    if (result.type === 'single') {
      downloadUrl = `/download/${result.uuid}/${result.file.name}`;
    } else if (result.type === 'zip') {
      downloadUrl = `/download/${result.uuid}/${result.name}`;
    }

    reply.send({ downloadUrl });
  } catch (error) {
    console.error('Erro ao converter áudio:', error);
    reply.status(500).send({ message: 'Erro ao converter áudio.' });
  }
};
