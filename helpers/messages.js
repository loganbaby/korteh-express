const moment = require('moment');
require('moment/locale/ru');

function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('HH:mm:ss')
    }
}

module.exports = formatMessage;