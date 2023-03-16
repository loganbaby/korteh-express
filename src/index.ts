import express from 'express'
import path from 'path'
import ViteExpress from 'vite-express'

const app = express()

const port = 3000

app.set('views', path.resolve('.', 'views/'));
app.set("view engine", "ejs");
console.log('path to /views: ' + path.resolve('.', 'views/'));

app.use('/', function (request, response) {
    response.render('index', {
        title: 'Студенческий портал demo'
    })
})

ViteExpress.listen(app, port, () => console.log(`Server started... on port ${port}`))