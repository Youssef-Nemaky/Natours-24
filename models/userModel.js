const crypto = require('crypto');

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
  passwordResetToken: String,
  passwordResetExpiresIn: Date,
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Leave 2 seconds margin to give DB time to save
  this.passwordChangedAt = Date.now() - 2000;
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

userSchema.methods.createPasswordResetToken = function () {
  const generatedToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(generatedToken)
    .digest('hex');

  this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000; //should be valid for 10 minutes

  return generatedToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
