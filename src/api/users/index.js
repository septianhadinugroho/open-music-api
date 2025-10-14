const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = (service, validator) => {
  const usersHandler = new UsersHandler(service, validator);
  return routes(usersHandler);
};