'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const pgp = require("pg-promise")(/*options*/);
const db = pgp('postgres://logbaby:666@localhost:3000/korteh-project');     // path to your postgreSQL database

const app = express();

const urlencodedParser = bodyParser.urlencoded({
    extended: false,
});

const port = 3000;

app.set('views', path.resolve('.', 'views'));
app.set("view engine", "ejs");
console.log('path to /views: ' + path.resolve('.', 'views/'));

app.use(express.static(path.resolve('.', 'public')));
console.log('path to /public: ' + path.resolve('.', 'public/'));

app.get('/send-email-response', urlencodedParser, function (request, response) {
    console.log('got -> /send-email-response');
});

app.post('/send-email-response', urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    console.log("%j", request.body);        // cannot convert to primitive type Object
    
    response.redirect('/');
});

app.get('/login', urlencodedParser, function (request, response) {
    console.log('got -> /login');

    response.render('login', {
        title: 'Login page demo'
    });
});

app.use('/', function (request, response, next) {
    response.render('index', {
        title: 'Студенческий портал demo'
    });
});

app.listen(port, () => console.log(`Server started... on port ${port}`));
