const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.get('/api', function(req ,res){
    console.log(req.url);
    res.send("get");
});

app.post('api/posts', verifyToken, (req, res) => {
    res.send("Ye");
});

app.post('api/users/login', function(req, res){
    jwt.sign({user: user}, 'secretkey', function(err, token){
        res.send(token);
    });
});

app.listen(3005, () => console.log("listening on port 5000"));

function verifyToken(req, res, next){
    //get auth header
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefiend
    if(typeof bearer !== 'undefiend'){

    }else{
        //Forbidden
        res.sendStatus(403);
    }
}
