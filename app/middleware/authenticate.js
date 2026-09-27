const User = require('../models/user.server.model');

/**
 * Authentication middleware
 * Read Authorization header, verify session_token
 * Attach user object to req.user if valid
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.sendStatus(401);
    }

    const sessionToken = authHeader;
    const user = await User.findOne({ where: { session_token: sessionToken } });

    if (!user) {
      return res.sendStatus(401);
    }

    // Pass user data to subsequent controllers
    req.user = user;
    next();

  } catch (err) {
    return res.sendStatus(500);
  }
};

module.exports = authenticate;
