const { createConnection, getRepository } = require('typeorm');
const User = require('./src/entities/User');

createConnection().then(async connection => {
  const userRepository = getRepository('User');

  const user1 = userRepository.create({
    name: 'Usuário Um',
    email: 'usuario1@example.com'
  });

  const user2 = userRepository.create({
    name: 'Usuário Dois',
    email: 'usuario2@example.com'
  });

  await userRepository.save([user1, user2]);

  console.log('Dois usuários inseridos com sucesso!');
  process.exit(0);
}).catch(error => {
  console.error('Erro ao inserir usuários:', error);
  process.exit(1);
});