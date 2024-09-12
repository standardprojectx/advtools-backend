const fastify = require('fastify')({ logger: true });
// const cors = require('@fastify/cors');
const multer = require('fastify-multer');
const path = require('path');


// fastify.register(cors, {
//   origin: '*',
//   methods: ['GET', 'POST', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
// });



fastify.register(multer.contentParser);


fastify.register(require('./routes/audioRoutes'));
fastify.register(require('./routes/imageRoutes'));
fastify.register(require('./routes/pdfRoutes'));
fastify.register(require('./routes/homeRoutes'));


fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/', 
});


fastify.listen({ port: 4000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info('Servidor rodando na porta 4000');
});
