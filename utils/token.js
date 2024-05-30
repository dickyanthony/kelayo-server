import jwt from 'jsonwebtoken';

function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

export { generateAccessToken };
