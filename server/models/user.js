const _ = require('lodash');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var _user = user.toObject();

  return _.pick(_user, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = async function () {
  try {
    var user = this;
    var access = 'auth';
    var token = jwt
      .sign({ _id: user._id.toHexString(), access }, 'secret')
      .toString();
    user.tokens.push({ access, token });
    await user.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

UserSchema.statics.findByToken = async function (token) {
  var User = this;
  var decoded;
  try {
    decoded = jwt.verify(token, 'secret');
  } catch (e) {
    return new Promise.reject();
  }

  return await User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };
