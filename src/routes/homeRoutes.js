async function homeRoutes(fastify, options) {
    fastify.get('/', async (req, res) => {
      return { message: 'Hello World' };
    });
  }
  
  module.exports = homeRoutes;