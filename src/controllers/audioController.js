const audioService = require('../services/audioService');

exports.convertAudio = async (req, res) => {
  const files = req.files;
  const conversionType = req.body.conversionType;

  try {
    await audioService.convertAudioVideo(files, conversionType, res);
  } catch (error) {
    console.error('Erro ao converter áudio:', error);
    res.status(500).send({ message: 'Erro ao converter áudio.' });
  }
};
