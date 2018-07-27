const express = require('express');
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/users/:id', function(req, res){
    User.countDocuments({_id: req.params.id}, function(err, count){
        if(count > 0){
            User.findById({_id: req.params.id}).then(function(user){
                res.send(user);
            });
        }else{
            res.sendStatus(400);
        }
    });
});

router.post('/users/register', function(req, res, next){
    User.find({
        email: req.body.email,
        })
        .then(user => {
            //it will create a user in every case, but the null user's len is 0
            if(user.length >= 1){
                return res.status(422).json({
                    message: "User with this email already exists"
                });
            }else{
                bcrypt.hash(req.body.password, 10, function(err, hash){
                    if(err){
                        return res.status(500).json({
                            error: err.message
                        });
                    }else{
                        const newUser = new User({
                            name: req.body.name,
                            password: hash,
                            email: req.body.email,
                            age: req.body.age,
                            education: req.body.education
                        });
                        newUser.save()
                        .then(result => {
                            console.log(result);
                            res.status(201).json({
                                message: "User created!"
                            });
                        }).catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err.message
                            });
                        });
                    }
                });
            }
        });

});

router.post('/users/login', function(req, res){
    User.find({
        email: req.body.email
    })
    //returns an array of users(but we know there is only 1)
    .then(user => {
        if(user.length < 1){
            return res.status(401).json({
                message: "Auth failed"
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) =>{
            if(err){
                return res.status(401).json({
                    message: "Atuh failed"
                });
            }
            //the password is correct
            if(result){
                const token = jwt.sign(
                {
                    email: user[0].email,
                    userID: user[0]._id
                },
                "secretkey",
                {
                    expiresIn: "2h"
                });
                return res.status(200).json({
                    message: "Atuh successful",
                    token: token
                });
            }else{
                return res.status(401).json({
                    message: "Atuh failed"
                });
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err.message,
        });
    });
});

//update a user
router.put('/users/:id', function(req, res){
    User.countDocuments({_id: req.params.id}, function(err, count){
        if(count > 0){
            User.findByIdAndUpdate({_id: req.params.id}, req.body).then(function(user){
                User.findById({_id: req.params.id}).then(function(user){
                    res.send(user);
                });
            });
        }else{
            res.sendStatus(400);
        }
    });
});

//delete a user
router.delete('/users/:id', function(req, res){
    User.countDocuments({_id: req.params.id}, function(err, count){
        if(count > 0){
            User.findByIdAndRemove({_id: req.params.id}).then(function(user){
                res.json({
                    message: "User deleted"
                });
            });
        }else{
            res.status(400).json({
                message: "No such user"
            });
        }
    });
    
});

router.get('/posts', function(req, res){
    Post.find({}).then(function(posts){
        res.send(posts);
    });
});

router.get('/users/:id/posts', function(req, res){  
    User.countDocuments({_id: req.params.id}, function(err, count){
        if(count > 0){
            Post.find({author: req.params.id}).then(function(posts){
                res.send(posts);
            });
        }else{
            res.sendStatus(400);
        }
    });
});

router.post('/users/:id/posts', checkAuth, function(req, res){
    // 1. callback hell & async/await
    // arrow functions
    // 2. Validate every POST/PUT/UPDATE/DELETE requests 
    User.countDocuments({_id: req.params.id}, function(err, count){
        if(count > 0){
            req.body.author = req.params.id;
            Post.create(req.body).then(function(post){
                res.send(post);
            }).catch(err => {
                console.log(err.message);
                return res.status(400).json({
                    message: err.message
                })
            });
        }else{
            res.sendStatus(400);
        }
    });
});
  
function checkAuth(req, res, next){
    try{
        const bearerHeader = req.headers.authorization;
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        console.log(token);
        const decoded = jwt.verify(token, "secretkey");        
        req.userData = decoded;
        console.log(token);        
        next();
     }catch(error){
         return res.status(401).json({
             message: error.message
         });
     }
}

module.exports = router;