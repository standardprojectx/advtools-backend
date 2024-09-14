const userController = require('../controllers/userController');

async function userRoutes(fastify, options) {
  fastify.get('/users', userController.getUsers);
  
  fastify.delete('/users/:id', userController.deleteUser);
}

module.exports = userRoutes;