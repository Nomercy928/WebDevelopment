const db = require('../../database');
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
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE session_token = ?", [sessionToken], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    if (!user) {
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};
module.exports = authenticate;
