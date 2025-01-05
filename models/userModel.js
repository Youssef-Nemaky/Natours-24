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
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'guide', 'lead-guide'],
      default: 'user',
      message: 'role can either be user, admin, guide and lead-guide',
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

userSchema.methods.hasPasswordChanged = function (tokenIat) {
  if (this.passwordChangedAt) {
    //convert the date to timestamp in seconds
    const passwordChangedAt = this.passwordChangedAt.getTime() / 1000;

    if (passwordChangedAt > tokenIat) {
      //password has been changed after the token has been issued
      return true;
    }
  }

  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
