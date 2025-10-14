const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postUserHandler(req, res, next) {
    try {
      this._validator.validateUserPayload(req.body);
      const userId = await this._service.addUser(req.body);
      return res.status(201).json({
        status: 'success',
        data: {
          userId,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = UsersHandler;