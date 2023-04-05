'use strict'

require('dotenv').config();                            // create .env file with dependencies

if (process.env.DEBUG == 'true') {
  console.log(process.env);
}

const EMAIL_AUTH = process.env.EMAIL_AUTH;
const EMAIL_PASS_AUTH = process.env.EMAIL_PASS_AUTH;

const winston = require('winston');
const logging = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: './.log/messages.log', level: 'info' }),
  ],
});

const db = require('./src/db');
db.authenticate().catch(error => console.error(error));

const express = require('express');
const app = express();
const session = require('express-session');

const formatMessage = require('./helpers/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./helpers/users');

const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const botName = 'Korteh chat demo';

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');

const path = require('path');
const nodemailer = require("nodemailer");

const bcrypt = require("bcrypt");

const urlencodedParser = bodyParser.urlencoded({
    extended: false,
});

const port = 3000;

const Users = require('./models/users');

async function initDatabase() {
  await Users.sync({ force: true });
  console.log('Table Users created [force] again!');
}

initDatabase();

app.set('views', path.resolve('.', 'views'));
app.set("view engine", "ejs");
console.log('path to /views: ' + path.resolve('.', 'views/'));

app.use(express.static(path.resolve('.', 'public')));
console.log('path to /public: ' + path.resolve('.', 'public/'));

app.use(cookieParser());
app.use(bodyParser.json());

app.use(session({
  cookie: { maxAge: 60000 },
  secret: 'codeworkrsecret',
  saveUninitialized: false,
  resave: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

app.post('/emailentry', urlencodedParser, async function (request, response) {           // handler of form to send mail response
  console.log('got -> /emailentry');

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

  const mailOptions = {
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

app.get('/login', urlencodedParser, async function (request, response) {
    console.log('got -> /login');

    response.render('login', {
        title: 'Login page demo'
    });
});

app.get('/chat', urlencodedParser, async function (request, response) {
  console.log('got -> /chat');

  response.render('chat', {
      title: 'Chat page  demo'
  });
});

app.get('/messages_wrapper', urlencodedParser, async function (request, response) {
  console.log('got -> /messages_wrapper');

  response.render('messages_wrapper', {
      title: 'Chat page  demo'
  });
});

app.post('/register', urlencodedParser, async function (request, response) {
  console.log('got -> /register');

  if (await Users.findOne({where: { email: request.body.email }})) {
    console.log('User with this email already exists! Try another email data.');
    response.status(400).json({ error: "User with this email already exists! Try another email data." });
  } else if (await Users.findOne({where: { login: request.body.login }})) {
    console.log('User with this login already exists! Try another login data.');
    response.status(400).json({ error: "User with this login already exists! Try another login data" });
  }

  if (request.body.password == request.body.passwordconfirm) {
    const salt = await bcrypt.genSalt(10);
    let bcryptPassword = await bcrypt.hash(request.body.password, salt);

    let result = await Users.create({
      login: request.body.login,
      email: request.body.email,
      password: bcryptPassword
    });

    if (result) {
      response.render('login', {
        title: 'Login page demo'
      });
    } else {
      console.log('Adding to db failed. Please fill the form correctly!');
    }
  } else {
    response.status(400).json({ error: "Password not comfirmed" });
  }
});

app.post('/login-into', urlencodedParser, async function (request, response) {
  console.log('got -> /login-into');

  const user = await Users.findOne({where: { login: request.body.login }});

  console.log(await Users.findOne({where: { login: request.body.login }}));

  if (user != null || user != undefined) { console.log(await bcrypt.compare(request.body.password, user.password)); }

  if ((user != null && user != undefined) && await bcrypt.compare(request.body.password, user.password)) {
    response.render('me', {
      title: 'My account'
    });
  } else {
    response.render('register', {
      title: 'Register page demo'
    });
  }
});

io.on('connection', socket => {                              // listener for next connecting
  socket.on('joinRoom', ({username, room}) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);
      socket.emit('message', formatMessage(botName, 'Welcome to Korteh demo chat'));
      logging.info(`[${new Date().toLocaleString()}] User ${user.username} entered into [chat] ${user.room}`);

      socket.broadcast.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has joined the chat`));

      io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
      })
  });

  socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit('message', formatMessage(user.username, msg));
      logging.info(`[${new Date().toLocaleString()}] ${user.username} - ${msg}`);
  });

  socket.on('disconnect', () => {
      const user = userLeave(socket.id);

      if (user) {
          io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the chat`));
          io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room)
          })
      }
  });
});

app.use('/', async function (request, response, next) {
    response.render('index', {
        title: 'Студенческий портал demo'
    });
});

server.listen(port, () => console.log(`Server started... on port ${port}`));
