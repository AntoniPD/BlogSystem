const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    topic:{
        type: String,
        required: [true, 'Topic field is required']
    },
    date: {
        type: Date,
        default: Date.now
    },
    title:{
        type: String,
        required: [true, 'Title field is required'],
        match: /^[A-Z][a-z0-9_-\s]{3,30}$/
    },
    content:{
        type: String,
        required: [true, 'Content field is required'],
        match: /^[A-Z][a-z0-9_-]{20,}$/
    }
});

const Post = mongoose.model('post', PostSchema);

module.exports = Post;