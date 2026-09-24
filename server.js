const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let gameHistory = [];
let countdown = 30;
let currentPeriod = "2026092401"; 
let gameState = "betting";

setInterval(() => {
    if (countdown > 0) {
        countdown--;
    } else {
        if (gameState === "betting") {
            gameState = "result";
            countdown = 5;
            const winningNumber = Math.floor(Math.random() * 10);
            let color = '';
            if (winningNumber === 0) color = 'red-violet';
            else if (winningNumber === 5) color = 'green-violet';
            else if ([1, 3, 7, 9].includes(winningNumber)) color = 'green';
            else color = 'red';

            let size = winningNumber >= 5 ? 'Big' : 'Small';

            const resultData = {
                period: currentPeriod,
                number: winningNumber,
                color: color,
                size: size
            };

            gameHistory.unshift(resultData);
            if (gameHistory.length > 10) gameHistory.pop();

            io.emit('gameResult', resultData);
        } else {
            gameState = "betting";
            countdown = 30;
            currentPeriod = (parseInt(currentPeriod) + 1).toString();
            io.emit('newRound', { period: currentPeriod, countdown });
        }
    }
    io.emit('timerUpdate', { countdown, gameState, period: currentPeriod });
}, 1000);

io.on('connection', (socket) => {
    socket.emit('init', { countdown, gameState, period: currentPeriod, history: gameHistory });

    socket.on('placeBet', (data) => {
        socket.emit('betSuccess', { message: 'Bet placed successfully!' });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
