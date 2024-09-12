
const { createConnection } = require('typeorm');

createConnection().then(() => {
  console.log('Conectado ao banco de dados');
}).catch((error) => {
  console.log('Erro ao conectar no banco de dados:', error);
});
