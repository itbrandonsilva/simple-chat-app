"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var axios_1 = require("axios");
var http = require("http");
var cors = require("cors");
var app = express();
var server = new http.Server(app);
var io = require("socket.io")(server);
app.use(cors());
function leaveChat(socket) {
    Object.keys(socket.rooms).forEach(function (room) {
        if (room !== 'lobby')
            socket.leave(room);
    });
}
function broadcastLobby() {
    var lobby = io.of('/');
    console.log('brawcast lahby');
    io.of('/').in('lobby').clients(function (err, clients) {
        //let clients = io.sockets.clients.room('lobby');
        console.log(clients);
        lobby.emit('users', clients);
    });
}
io.on('connection', function (socket) {
    socket.join('lobby');
    socket.on('id', function (id) {
        socket.id = id;
    });
    broadcastLobby();
    /*socket.on('join', (room) => {
        console.log(room);
        leaveChat(socket);
        socket.join(room);
    });*/
    /*socket.on('leave', () => {
        leaveChat(socket);
    });*/
    socket.on('msg', function (msg) {
        socket.to('lobby').emit(msg);
    });
    socket.on('disconnect', function (socket) {
        broadcastLobby();
    });
});
app.get('/search', function (req, res) {
    var search = req.params.search;
    axios_1.default.get("https://api.giphy.com/v1/gifs/search?api_key=eCbYNG9wl6MyHkDLxQRbHxlnBp4S6Hm9&q=" + search + "&limit=10")
        .then(function (giphy) {
        //giphy.data.data.map((entry: any) => entry.bitly_gif_url));
        var data = giphy.data.data.map(function (entry) { return entry.images.original.url; });
        res.json(data);
    }).catch(function (err) {
        throw err;
    });
});
server.listen(3000, function () {
    console.log('Listening...');
});
