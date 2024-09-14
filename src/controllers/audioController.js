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
      // Enviar o arquivo único
      reply
        .header('Content-Type', 'application/octet-stream')
        .header('Content-Disposition', `attachment; filename="${result.file.name}"`)
        .send(fs.createReadStream(result.file.path));
    } else if (result.type === 'zip') {
      // Enviar o arquivo zip
      reply
        .header('Content-Type', 'application/zip')
        .header('Content-Disposition', `attachment; filename="${result.name}"`)
        .send(fs.createReadStream(result.path));
    }
  } catch (error) {
    console.error('Erro ao converter áudio:', error);
    reply.status(500).send({ message: 'Erro ao converter áudio.' });
  }
};
