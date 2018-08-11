import * as express from 'express';
import axios from 'axios';
import * as http from 'http';
import { Socket } from 'socket.io';
import * as cors from 'cors';

const app = express();
const server = new http.Server(app);
const io = require("socket.io")(server);

app.use(cors());

const lobby = io.of('/').in('lobby');

function broadcastLobby() {
    io.of('/').in('lobby').clients((err: any, clients: any) => {
        let names = clients.map((client: string) => (io.sockets.connected[client] as any)._customId || client);
        lobby.emit('users', names);
    });
}

io.on('connection', (socket: Socket) => {
    socket.join('lobby');
    broadcastLobby();

    socket.on('id', (id) => {
        (socket as any)._customId = id;
        broadcastLobby();
    });

    socket.on('send-msg', (msg) => {
        lobby.emit('msg', msg);
    });

    socket.on('disconnect', (socket) => {
        broadcastLobby();
    });
});

app.get('/search/:search', (req, res) => {
    let search = req.params.search;
    axios.get(`https://api.giphy.com/v1/gifs/search?api_key=eCbYNG9wl6MyHkDLxQRbHxlnBp4S6Hm9&q=${search}&limit=20`)
        .then(giphy => {
            //giphy.data.data.map((entry: any) => entry.bitly_gif_url));
            let data = giphy.data.data.map((entry: any) => entry.images.original.url);
            res.json(data);
        }).catch(err => {
            console.error(err);
            res.json([]);
        })
});

server.listen(3000, () => {
    console.log('Listening...');
});