const express = require('express');
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

var passwordValidator = require('password-validator');

const schema = new passwordValidator();
 
// Add properties to it
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits()                                 // Must have digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']);

router.get('/users/:id', (req, res) => {
    User.countDocuments({_id: req.params.id}).then(count => {
        if(count > 0){
            User.findById({_id: req.params.id}).then(user => {
                return res.send(user);
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

router.post('/users/register', (req, res, next) => {
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
                
                if(schema.validate(req.body.password)){
                    bcrypt.hash(req.body.password, 10).then(hash => {
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
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err.message
                                });
                            });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err.message
                        });
                    });
                }else{
                    return res.status(401).json({
                        mesage: "Invalid password"
                    })
                }
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err.message
            });
        });
});

router.post('/users/login', (req, res) => {
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
        bcrypt.compare(req.body.password, user[0].password).then(result =>{
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
        })
        .catch(err => {
            res.status(401).json({
                error: err.mesage
            });
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err.message,
        });
    });
});

//update a user
router.put('/users/:id', (req, res) => {
    User.countDocuments({_id: req.params.id}).then(count => {        
        if(count > 0){
            User.findByIdAndUpdate({_id: req.params.id}, req.body).then(user => {
                User.findById({_id: req.params.id}).then(user => {
                    return res.send(user);
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

//delete a user
router.delete('/users/:id', (req, res) => {
    User.countDocuments({_id: req.params.id}).then(count => {
        if(count > 0){
            User.findByIdAndRemove({_id: req.params.id}).then(user =>{
                res.json({
                    message: "User deleted"
                });
            });
        }else{
            res.status(400).json({
                message: "No such user"
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err.mesage
        });
    });
    
});

router.get('/posts', (req, res) => {
    Post.find({}).then(posts => {
        return res.send(posts);
    })
    .catch(err => {
        res.status(500).json({
            error: err.mesage
        });
    });
});

router.get('/users/:id/posts', (req, res) => {  
    User.countDocuments({_id: req.params.id}, function(err, count){
        if(count > 0){
            Post.find({author: req.params.id}).then(posts => {
                return res.send(posts);
            });
        }else{
            return res.sendStatus(400);
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err.mesage
        });
    });
});

router.post('/users/:id/posts', checkAuth, (req, res) => {
    // 1. callback hell & async/await
    // arrow functions
    // 2. Validate every POST/PUT/UPDATE/DELETE requests 
    User.countDocuments({_id: req.params.id}).then(count =>{
        if(count > 0){
            req.body.author = req.params.id;
            Post.create(req.body).then(post => {
                res.send(post);
            })
            .catch(err => {
                console.log(err.message);
                res.status(400).json({
                    message: err.message
                })
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