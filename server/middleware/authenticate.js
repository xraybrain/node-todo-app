const { User } = require('./../models/user');

const authenticate = async (req, res, next) => {
  try {
    var token = req.header('x-auth');
    let user = await User.findByToken(token);

    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send();
  }
};

module.exports = { authenticate };
