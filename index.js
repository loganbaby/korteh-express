'use strict'

require('dotenv').config();                            // create .env file with dependencies
console.log(process.env);

const EMAIL_AUTH = process.env.EMAIL_AUTH;
const EMAIL_PASS_AUTH = process.env.EMAIL_PASS_AUTH;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const nodemailer = require("nodemailer");

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

app.get('/emailentry', urlencodedParser, function (request, response) {
    console.log('got -> /emailentry');
});

app.post('/emailentry', urlencodedParser, function (request, response) {           // handler of form to send mail response
    const output = `
        <p>You have a new contact request</p>
        <h3>Contact Details</h3>
        <ul>  
        <li>Name: ${request.body.name}</li>
        <li>Email: ${request.body.email}</li>
        <li>Phone: ${request.body.phone_number}</li>
        </ul>
        <h3>Message</h3>
        <p>${request.body.message}</p>
        <h3>Headers</h3>
        <ul>  
        <li>cookie: ${request.headers.cookie}</li>
        <li>user-agent: ${request.headers["user-agent"]}</li>
        <li>referer: ${request.headers["referer"]}</li>
        <li>IP: ${request.ip}</li>
        </ul>`;

  let smtpTransport;
  try {
    smtpTransport = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true, // true for 465, false for other ports 587
      auth: {
        user: `${EMAIL_AUTH}`,
        pass: `${EMAIL_PASS_AUTH}`
      }
    });
  } catch (e) {
    return console.log('Error: ' + e.name + ":" + e.message);
  }

  let mailOptions = {
    from: 'dmitrykotov89@yandex.ru', // sender address
    to: `${request.body.email}`, // list of receivers
    subject: 'Новая заявка с сайта Korteh', // Subject line
    text: 'Новая заявка с сайта Korteh', // plain text body
    html: output // html body
  };

  smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        } else {
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    });

    response.redirect('/#firework');
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
