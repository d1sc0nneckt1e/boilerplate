const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// register
router.post('/', async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;
    // validation
    if (!email || !password || !passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        errorMessage: "Please enter a password with at least 6 charecters.",
      });
    }
    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter the same password.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        errorMessage: "An account with this email exists.",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // save new user account to the db
    const newUser = new User({
      email,
      passwordHash,
    });
    const savedUser = await newUser.save();

    // sign token
    const token = jwt.sign(
      {
        user: savedUser._id,
      },
      process.env.JWT_SECRET
    );

    // send token in HTTP-only cookie
    res.cookie('token', token, {httpOnly: true,}).send();

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate
    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ errorMessage: "Wrong email or password."});
    }

    const passwordCorrect = await bcrypt.compare(
      password, 
      existingUser.passwordHash
    );

    if (!passwordCorrect) {
      return res.status(401).json({ errorMessage: "Wrong email or password."});
    }

    // sign token
    const token = jwt.sign(
      {
        user: existingUser._id,
      },
      process.env.JWT_SECRET
    );

    // send token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
    }).send();

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// logout
router.get('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expire: new Date(0),
  })
});

module.exports = router;
