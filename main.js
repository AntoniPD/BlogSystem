const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const utils = require('express-validator');
var utils1 = require('validator');

const app = express();

//thats the place of the database
mongoose.connect('mongodb://localhost:27017/usersDB', {useNewUrlParser: true});
mongoose.Promise = global.Promise;
//bodyParser

app.use(bodyParser.json());
//initialize routes
app.use('/api', require('./routes/routes'));



app.use((err, req, res, next) => {
    //console.log(err);
    res.status(422).send({error: err.message});
}).next;

app.listen(3000, () => console.log('listening on port 3000'));