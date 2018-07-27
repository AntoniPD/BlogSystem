const mongoose = require('mongoose');
const Post = require('./post');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:{
        type: String,
        required: [true, 'username field is required']
    },
    password:{
        type: String,
        required: [true, 'Password field is required']
    },
    email:{
        type: String,
        required: [true, 'Email field is required'],
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    age: Number,
    education: String
});

//defines a user with the UserSchema skeleton
const User = mongoose.model('user', UserSchema);

module.exports = User;