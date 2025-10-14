const Jwt = require('jsonwebtoken');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) => {
    // UBAH BARIS DI BAWAH INI
    const expiresInNumber = parseInt(process.env.ACCESS_TOKEN_AGE, 10);

    return Jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
      // GUNAKAN VARIABEL BARU DI SINI
      expiresIn: expiresInNumber,
    });
  },
  generateRefreshToken: (payload) => Jwt.sign(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifact = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      return artifact;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;