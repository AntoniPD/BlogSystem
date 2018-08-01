const mongoose = require('mongoose');
const Post = require('./post');
const validId = require('mongoose-valid-id');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:{
        type: String,
        required: [true, 'username field is required'],
        match: /^[A-Z][a-z0-9_-]{1,}$/
    },
    password:{
        type: String,
        required: [true, 'Password field is required'],
    },
    email:{
        type: String,
        required: [true, 'Email field is required'],
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    age: {
        type: Number,
    },
    education: String
});

//defines a user with the UserSchema skeleton
const User = mongoose.model('user', UserSchema);

module.exports = User;