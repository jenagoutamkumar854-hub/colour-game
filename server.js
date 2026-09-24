const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let currentPeriod = "20260924001";
let countdown = 30; // 30 seconds timer
let bets = { red: 0, green: 0 };
let lastResult = "Waiting";

// Timer Loop
setInterval(() => {
    countdown--;
    if (countdown <= 0) {
        // House Profit Logic: Jis taraf kam paisa, woh jeeta do
        if (bets.red < bets.green) {
            lastResult = "red";
        } else {
            lastResult = "green";
        }

        console.log(`Period ${currentPeriod} Ended. Winner: ${lastResult}`);

        // Reset for next period
        currentPeriod = (parseInt(currentPeriod) + 1).toString();
        countdown = 30;
        bets = { red: 0, green: 0 };
    }

    // Broadcast data to all clients
    io.emit('gameData', {
        period: currentPeriod,
        timer: countdown,
        result: lastResult
    });
}, 1000);

// Bet API endpoint
app.post('/api/bet', (req, res) => {
    const { color, amount } = req.body;
    if (color === 'red') bets.red += amount;
    if (color === 'green') bets.green += amount;
    res.json({ success: true, message: "Bet placed successfully" });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
