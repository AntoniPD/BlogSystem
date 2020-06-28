const express = require('express');
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/users:id', (req, res) => {
    User.countDocuments({_id: req.params.id}).then(count => {
        if(count > 0){
            User.findById({_id: req. params}).then(user => {
                return res.send(user);
            })
            .catch(err => {
                res.status(500).json({
                    error: err.mesage
                });
            });
        }else{
            return res.status(400).json({
                message: "User not found"
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err.mesage
        });
    });
});

console.log("here");