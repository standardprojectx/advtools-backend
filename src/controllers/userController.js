const { getRepository } = require('typeorm');

exports.getUsers = async (req, res) => {
  try {
    const userRepository = getRepository('User');
    const users = await userRepository.find();
    res.send(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).send({ message: 'Erro ao buscar usuários.' });
  }
};


exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const userRepository = getRepository('User');
    const user = await userRepository.findOne(userId);

    if (!user) {
      return res.status(404).send({ message: 'Usuário não encontrado.' });
    }

    await userRepository.remove(user);
    res.send({ message: 'Usuário removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    res.status(500).send({ message: 'Erro ao remover usuário.' });
  }
};