require('dotenv').config();
const log = console.log;
const express = require('express');
const app = express();
const schedule = require('node-schedule');

const PORT = process.env.PORT || 3100;
const server = app.listen(PORT, () => log(`Server started on PORT ${PORT}`));

//Routes
app.use(express.json({ extended: false }));
app.use('/order', require('./Routes/order'));

//Initialize Modules
const tickStatic = require('./Components/tickStatic');
const orders = require('./Components/orders');
const uws = require('./Components/uws');
tickStatic.getData();
uws.startSocket();

//Schedule jobs
schedule.scheduleJob('5 0 * * *', tickStatic.getData);
schedule.scheduleJob('10 0 * * *', orders.deleteCompleted);

//Socket
const socket = require('socket.io');
const io = socket(server);

io.on('connection', () => {
  io.emit('TICKSTATIC', tickStatic.data);
  io.emit('ORDERS', orders.data);
});

//Order Updates
const orderE = require('./Utils/orderE');

orderE.eventEmitter.on('ORDERUPDATE', (payload) => {
  io.emit('ORDERUPDATE', payload);
});
