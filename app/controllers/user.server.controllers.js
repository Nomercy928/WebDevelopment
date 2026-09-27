const User = require('../models/user.server.model');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Register a new user
 * POST /users
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Validate required input fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if email already exists in database
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user record
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword
    });

    // Return 201 Created, do NOT return password or salt
    return res.status(201).json({
      user_id: newUser.user_id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email
    });

  } catch (err) {
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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Compare plain password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Generate new unique session token
    const sessionToken = uuidv4();
    user.session_token = sessionToken;
    await user.save();

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
    // req.user is attached by authenticate middleware
    const user = req.user;

    return res.status(200).json({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    });

  } catch (err) {
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
    user.session_token = null;
    await user.save();

    // 204 No Content, no response body
    return res.sendStatus(204);

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser
};
