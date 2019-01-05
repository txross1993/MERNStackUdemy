//Auth
const express = require('express'); // To use the router, you must bring in express first
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../../config/keys').secretOrKey;

// Load user model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) =>
  res.json({
    msg: 'Users works'
  })
); //Returns a 200 status

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
  // First, use mongo to check if the email already exists
  User.findOne({ email: req.body.email }).then(user => {
    //When you use .then, you're using a promise
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', //size
        r: 'pg', //rating
        d: 'mm' //default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   POST api/users/login
// @desc    Login User / Return token
// @access  Public
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: 'User not found' });
    }

    //Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched, generate token

        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        }; // Create JWT payload

        jwt.sign(payload, key, { expiresIn: 3600 }, (err, token) => {
          res.json({
            sucecss: true,
            token: 'Bearer' + token
          });
        });
      } else {
        return res
          .status(400)
          .json({ password: 'Incorrect login information' });
      }
    });
  });
});

module.exports = router;
