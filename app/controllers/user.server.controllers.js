const db = require('../../database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Register a new user
 * POST /users
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if email exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password,10);
    // Insert new user
    const newUser = await new Promise((resolve, reject) => {
      db.run(`INSERT INTO users (first_name,last_name,email,password) VALUES (?,?,?,?)`,
        [first_name,last_name,email,hashedPassword],
        function(err) {
          if(err) return reject(err);
          resolve({user_id: this.lastID, first_name,last_name,email});
        }
      )
    });

    return res.status(201).json({
      user_id: newUser.user_id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * User login, generate session token
 * POST /users/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if(err) return reject(err);
        resolve(row);
      })
    });
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }
    const sessionToken = uuidv4();
    // update token
    await new Promise((resolve,reject)=>{
      db.run(`UPDATE users SET session_token = ? WHERE user_id = ?`,
        [sessionToken, user.user_id],
        (err)=>{
          if(err) return reject(err);
          resolve();
        }
      )
    });
    return res.status(200).json({
      session_token: sessionToken,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get profile of currently authenticated user
 * GET /users/me
 * Requires authenticate middleware
 */
const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Logout user: clear session token
 * POST /users/logout
 * Requires authenticate middleware
 */
const logoutUser = async (req, res) => {
  try {
    const user = req.user;
    await new Promise((resolve,reject)=>{
      db.run(`UPDATE users SET session_token = NULL WHERE user_id = ?`,
        [user.user_id],
        (err)=>{
          if(err) return reject(err);
          resolve();
        }
      )
    })
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser
};
