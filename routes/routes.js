const express = require('express');
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');
var utils = require('../utilities/utils');

const router = express.Router();

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

router.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    //isMongoId works fine
    if(utils.isMongoId(id)){
        try{
            const user = await User.findById({ _id: id }).exec();
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            } else {
                return res.send(user);
            }
        }catch(err){
            return res.status(400).send({
                message: "Something went wrong"
            });
        }
    }else{
        return res.send({
            message: "Invalid id"
        });
    }
});

router.post('/users/register', async (req, res, next) => {
    const { email, name, password, age, education } = req.body; 
    if(utils.isEmail(email) &&
        utils.isAlpha(name) && 
            password.length > 8 && 
                age > 10){
        try{
            const user = await User.find({
                email: email,
                }).exec();
            
            if(user.length >= 1){
                return res.status(422).json({
                    message: "User with this email already exists"
                });
            }

            if(schema.validate(password)){
                const hash = await new Promise((resolve, reject) =>{
                    resolve(bcrypt.hash(password, 10));
                });
                const newUser = new User({
                    name: name,
                    password: hash,
                    email: email,
                    age: age,
                    education: education
                });
                newUser.save();
                return res.send(newUser);
            }else{
                return res.status(401).json({
                    mesage: "Invalid password"
                })
            }
        }catch(err){
                return res.status(400).send({
                    message: "Something went wrong"
                });
        }
    }else{
        return res.send({
            message: "Registration failed"
        });
    }
});

router.post('/users/login',async (req, res) => {
    const { email, password } = req.body;
    if(utils.isEmail(email) && password.length > 8){
        try{
            const user = await User.find({
                email: email
            }).exec();
        
            if(user.length < 1){
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            const result = bcrypt.compare(password, user[0].password);
        
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
        }catch(err){
            return res.status(400).send({
                message: "Something went wrong"
            });
        }
    }else{
        return res.send({
            message: "Loging failed"
        });
    }
});

//update a user
router.put('/users/:id', async (req, res) => {
    const { email, name, password, age, education } = req.body; 
    const id = req.params.id;
    if(utils.isEmail(email) && 
            utils.isAlpha(name) && 
                password.length > 8 && 
                    age > 10){
        try{
            const user = await User.findById({ _id: id }).exec();
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            } else {
                try{
                    const user = await User.findByIdAndUpdate(
                    {
                        _id: id
                    }, 
                    { 
                        name: name, 
                        password: password,
                        email: email,  
                        age: age,
                        education: education
                    }).exec();
                    //otherwise returns the previous user
                    const someUser = await User.findById({_id: id}).exec();
                    return res.send(someUser);
                }catch(err){
                    return res.status(400).send({
                        message: "Something went wrong"
                    });
                }
            }
        }catch(err){
            return res.status(400).send({
                message: "Something went wrong"
            });
        }
    }else{
        return res.send({
            message: "Updating failed"
        });
    }
});

//delete a user
router.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    if(utils.isMongoId(id)){
        try{
            const user = await User.findById({ _id: id }).exec();
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            } else {
                const removed = await User.findByIdAndRemove({_id: id}).exec();
                return res.json({
                           message: "User deleted"
                    });
            }
        }catch(err){
            return res.status(400).send({
                message: "Something went wrong"
            });
        }
    }else{
        return res.send({
            message: "Deleting failed"
        });
    }
});

router.get('/posts',async (req, res) => {
    try{
        const posts = await Post.find({}).exec();
        if(!posts){
            return res.status(404).json({
                message: "No posts found"
            });
        }else{
            return res.send(posts);
        }
    }catch(err){
        res.send(err.mesage);
        return res.status(400).send({
            message: "Something went wrong"
        });
    }
});

router.get('/users/:id/posts',async (req, res) => { 
    const id = req.params.id; 
    if(utils.isMongoId(id)){
        try{
            const user = await User.findById({ _id: id }).exec();
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            } else {
                const posts = await Post.find({author: id}).exec();
                if(!posts){
                    return res.status(404).json({
                        message: "No posts found"
                    });
                }else{
                    return res.send(posts);
                }
            }
        }catch(err){
            return res.status(400).send({
                message: "Something went wrong"
            });
        }
    }else{
        return res.send({
            message: "Invalid Id"
        });
    }
});

router.post('/users/:id/posts', checkAuth, async (req, res) => {
    // 1. callback hell & async/await
    // arrow functions
    // 2. Validate every POST/PUT/UPDATE/DELETE requests 
    const { topic, title, content } = req.body;
    const id = req.params.id;
    if(utils.isMongoId(id) && content.length > 20 && topic.length > 3 && title.length > 3){
        try{
            const user = await User.findById({ _id: id }).exec();
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            } else {
                req.body.author = id;
                const confPost = await new Promise((resolve, reject) =>{
                    resolve(Post.create({
                        author: req.body.author,
                        topic: topic,
                        title: title,
                        content: content
                    }));
                });
                return res.send(confPost);
            }
        }catch(err){
            return res.status(400).send({
                message: "Something went wrong"
            });
        }
    }else{
        return res.send({
            message: "Something failed"
        });
    } 
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