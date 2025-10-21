const Jwt = require('jsonwebtoken');
const InvariantError = require('../exceptions/InvariantError');
const config = require('../utils/config'); 

const TokenManager = {
  generateAccessToken: (payload) => {

    const expiresInNumber = parseInt(config.jwt.accessTokenAge, 10); 

    return Jwt.sign(payload, config.jwt.accessTokenKey, { 
      expiresIn: expiresInNumber,
    });
  },
  generateRefreshToken: (payload) => Jwt.sign(payload, config.jwt.refreshTokenKey),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifact = Jwt.verify(refreshToken, config.jwt.refreshTokenKey);
      return artifact;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;