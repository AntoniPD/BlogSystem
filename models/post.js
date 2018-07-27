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
        required: [true, 'Title field is required']
    },
    content:{
        type: String,
        required: [true, 'Content field is required']
    }
});

const Post = mongoose.model('post', PostSchema);

module.exports = Post;