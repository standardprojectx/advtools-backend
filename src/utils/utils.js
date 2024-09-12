const jwt = require('jsonwebtoken');
const path = require('path');

exports.generateRandomFileName = (originalName) => {
  const token = jwt.sign({ data: originalName }, 'secret', { expiresIn: '1h' });
  const extension = path.extname(originalName);
  return `${token}${extension}`;
};
