const fastify = require('fastify')({ logger: true });
const multer = require('fastify-multer');
const path = require('path');
const { createConnection } = require('typeorm');

const User = require('./entities/User');

fastify.register(require('./routes/audioRoutes'));
fastify.register(require('./routes/imageRoutes'));
fastify.register(require('./routes/pdfRoutes'));
fastify.register(require('./routes/homeRoutes'));
fastify.register(require('./routes/userRoutes'));

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/', 
});

fastify.register(multer.contentParser);

// Conectar ao banco de dados
createConnection().then(() => {
  fastify.log.info('Conectado ao banco de dados com sucesso');
}).catch(error => {
  fastify.log.error('Erro ao conectar ao banco de dados:', error);
  process.exit(1);
});

// Iniciar o servidor
fastify.listen({ port: 4000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info('Servidor rodando na porta 4000');
});
