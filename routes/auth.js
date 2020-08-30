const express = require('express');
const authController = require('../controllers/auth');
const { body } = require('express-validator');
const router = express.Router();
const User = require('../models/user');

router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);
router.post(
  '/login',
  [
    body('email', 'input cannot be empty')
      .isEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (!user) {
          throw new Error('Invalid credentials');
        }
      }),
  ],
  authController.postLogin
);
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('please enter valid email')
      .custom(async (value, { req }) => {
        let user = await User.findOne({ email: value });
        if (user)
          throw new Error('Email already exist, please pick a different one');
      }),
    body(
      'password',
      'please enter a password that is text or number with at least 5 character'
    )
      .isLength({ min: 5 })
      .trim()
      .isAlphanumeric(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password)
          throw new Error('Password has to match');
        return true;
      }),
  ],
  authController.postRegister
);
router.post('/logout', authController.postLogout);

router.get('/reset', authController.getResetPassword);
router.post('/reset', authController.postResetPassword);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
