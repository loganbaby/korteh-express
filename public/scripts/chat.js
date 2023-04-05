const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// парсинг get параметров
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

function outputMessage(message) {
    const div = document.createElement('div');

    div.classList.add('message');
    div.innerHTML = `
                <p class="meta">${message.username}<span> ${message.time}</span></p>

                <p class="text">
                    ${message.text}
                </p>
                `;
    document.querySelector('.chat-messages').appendChild(div);
}

// отрисовка имени комнаты в DOM
function outputRoom(room) {
    roomName.innerText = room;
}

// отрисовка активных юезров в комнате в DOM
function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

// инициализация сокета
const socket = io();

// ответ при соединении с комнатой
socket.emit('joinRoom', {username, room});

// listener roomUsers
socket.on('roomUsers', ({room, users}) => {
    outputRoom(room);
    outputUsers(users);

    console.log('outputting')
});

// listener message - сообщение от сервера
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// отправка формы
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    // отправка на сервер
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});