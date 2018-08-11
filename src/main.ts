import * as express from 'express';
import axios from 'axios';
import * as http from 'http';
import { Socket } from 'socket.io';
import * as cors from 'cors';

const app = express();
const server = new http.Server(app);
const io = require("socket.io")(server);

app.use(cors());

function broadcastLobby() {
    const lobby = io.of('/');
    io.of('/').in('lobby').clients((err: any, clients: any) => {
        console.log(clients);
        lobby.emit('users', clients);
    });
}

io.on('connection', (socket: Socket) => {
    socket.join('lobby');
    broadcastLobby();

    socket.on('id', (id) => {
        socket.id = id;
        broadcastLobby();
    });

    socket.on('msg', (msg) => {
        socket.to('lobby').emit('msg', msg);
    });

    socket.on('disconnect', (socket) => {
        broadcastLobby();
    });
});

app.get('/search/:search', (req, res) => {
    let search = req.params.search;
    axios.get(`https://api.giphy.com/v1/gifs/search?api_key=eCbYNG9wl6MyHkDLxQRbHxlnBp4S6Hm9&q=${search}&limit=10`)
        .then(giphy => {
            //giphy.data.data.map((entry: any) => entry.bitly_gif_url));
            let data = giphy.data.data.map((entry: any) => entry.images.original.url);
            res.json(data);
        }).catch(err => {
            throw err;
        })
});

server.listen(3000, () => {
    console.log('Listening...');
});