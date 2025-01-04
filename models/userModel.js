const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name field is required'],
  },
  email: {
    type: String,
    unique: [true, 'This email was already used before'],
    required: [true, 'Email is required'],
    validate: {
      message: 'Invalid Email.',
      validator: function () {
        return validator.isEmail(this.email);
      },
    },
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirm is required'],
    validate: {
      message: 'Passwords do not match.',
      validator: function (pwd) {
        return this.password === pwd;
      },
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // exit if password was not changed.

  this.password = await bcrypt.hash(
    this.password,
    parseInt(process.env.BCRYPT_SALT, 10),
  );
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isCorrectPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
