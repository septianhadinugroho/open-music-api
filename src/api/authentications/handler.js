const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    autoBind(this);
  }

  async postAuthenticationHandler(req, res, next) {
    try {
      this._validator.validatePostAuthenticationPayload(req.body);
      const { username, password } = req.body;
      const id = await this._usersService.verifyUserCredential(username, password);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });

      await this._authenticationsService.addRefreshToken(refreshToken);

      return res.status(201).json({
        status: 'success',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async putAuthenticationHandler(req, res, next) {
    try {
      this._validator.validatePutAuthenticationPayload(req.body);
      const { refreshToken } = req.body;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
      const accessToken = this._tokenManager.generateAccessToken({ id });

      return res.status(200).json({
        status: 'success',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteAuthenticationHandler(req, res, next) {
    try {
      this._validator.validateDeleteAuthenticationPayload(req.body);
      const { refreshToken } = req.body;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);
      return res.status(200).json({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AuthenticationsHandler;