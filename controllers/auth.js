const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const config = require('../config/default.json');

const transport = nodemailer.createTransport(
  sendgridTransport({
    auth: { api_key: config.sendgrid_api_key },
  })
);

const getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) message = message[0];
  else message = null;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'login',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: { email: '', password: '' },
    validationErrors: [],
  });
};

const postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
      validationErrors: errors.array(),
    });
  }
  try {
    const user = await User.findOne({ email });
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid credentials!',
        oldInput: { email, password },
        validationErrors: [],
      });
    }
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save((err) => {
      if (err) console.log(err);
      res.redirect('/');
    });
  } catch (err) {
    console.log(err);
  }
  // req.isLoggedIn = true;
};

const getRegister = (req, res, next) => {
  let message = req.flash('emailError');
  let inputMessage = req.flash('emptyInput');
  if (message.length > 0) message = message[0];
  else message = null;
  if (inputMessage.length > 0) inputMessage = inputMessage[0];
  else inputMessage = null;
  res.render('auth/register', {
    path: '/register',
    pageTitle: 'Register',
    isAuthenticated: false,
    errorMessage: message ? message : inputMessage ? inputMessage : null,
    oldInput: { email: '', confirmPassword: '', password: '' },
    validationErrors: [],
  });
};
const postRegister = async (req, res, next) => {
  const { email, confirmPassword } = req.body;
  let password = req.body.password;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/register', {
      path: '/register',
      pageTitle: 'Register',
      errorMessage: errors.array()[0].msg,
      oldInput: { email, confirmPassword, password },
      validationErrors: errors.array(),
    });
  }
  if (!email.trim() || !password.trim()) {
    req.flash('emptyInput', 'email or password cannot be empty');
    return res.redirect('/register');
  }

  try {
    password = await bcrypt.hash(password, 12);

    let user = new User({
      email,
      password,
      cart: { items: [] },
    });
    await user.save();
    res.redirect('/login');
    await transport.sendMail({
      to: email,
      from: 'bookShop@mail.com',
      subject: 'Successfully registered',
      html: '<h1>You are welcome to our service</h1>',
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

const getResetPassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) message = message[0];
  else message = null;
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
};
const postResetPassword = (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'No account with this email was found!');
      return res.redirect('/reset');
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;

    try {
      await user.save();
      res.redirect('/');
      await transport.sendMail({
        to: email,
        from: 'bookShop@mail.com',
        subject: 'Reset Password',
        html: `
        <p>You request to reset your password</p>
        <p>Click this <a href='http://localhost:5000/reset/${token}'>link</a>  to set a new password<p>`,
      });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  });
};

const getNewPassword = async (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) message = message[0];
  else message = null;
  const token = req.params.token;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });
  if (!user) {
    req.flash('Invalid credentials');
    return res.redirect('/reset');
  }
  res.render('auth/new-password', {
    path: '/new-password',
    pageTitle: 'New Password',
    errorMessage: message,
    userId: user._id,
    passwordToken: token,
  });
};

const postNewPassword = async (req, res, next) => {
  const { userId, passwordToken } = req.body;
  let { password } = req.body;
  try {
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    if (!user) {
      req.flash('Something went wrong');
      return res.redirect('/reset');
    }
    password = await bcrypt.hash(password, 12);
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect('/login');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
module.exports = {
  getLogin,
  getRegister,
  postLogin,
  postLogout,
  postRegister,
  getResetPassword,
  postResetPassword,
  getNewPassword,
  postNewPassword,
};
