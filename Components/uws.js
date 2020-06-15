const WebSocket = require('ws');
const fetch = require('../Utils/fetch');
const log = console.log;
const E = require('events');

let uws = {
  socketTimeout: '',
  keepAliveTimeout: '',
  retryAttempts: 0,
  eventEmitter: new E().setMaxListeners(1000),
  ws: '',
  listenkey: '',
  eventTime: 0,
  async startSocket() {
    try {
      uws.listenkey = '';
      clearTimeout(uws.socketTimeout);
      clearInterval(uws.keepAliveTimeout);
      uws.eventTime = 0;
      if (uws.ws) uws.ws.terminate();

      const rtype = 'startUserDataStreamFutures';
      const { listenKey } = await fetch({ rtype });
      uws.listenKey = listenKey;
      uws.ws = new WebSocket(`wss://fstream.binance.com/ws/${uws.listenKey}`);

      uws.ws.on('message', uws.processStream);
      uws.ws.on('ping', uws.heartbeat);

      //send keepalive request every 30 mins
      uws.keepAliveTimeout = setInterval(() => {
        const rtype = 'keepAliveUserDataStreamFutures';
        const funcpar = { listenKey: uws.listenKey };
        fetch({ rtype, funcpar });
      }, 30 * 60 * 1000);

      uws.retryAttempts = 0;
    } catch (err) {
      log(err);
      clearTimeout(uws.socketTimeout);
      uws.listenkey = '';
      clearInterval(uws.keepAliveTimeout);
      uws.retryAttempts++;
      if (uws.ws) uws.ws.terminate();
      if (uws.retryAttempts < 3) uws.startSocket();
    }
  },
  heartbeat() {
    clearTimeout(uws.socketTimeout);
    uws.socketTimeout = setTimeout(() => {
      //terminate socket and restart
      if (uws.ws) uws.ws.terminate();
      uws.startSocket();
    }, 3 * 60 * 1000 + 60 * 1000);
  },
  processStream(wsresp) {
    wsresp = JSON.parse(wsresp);
    const { e: update } = wsresp;

    if (update !== 'ORDER_TRADE_UPDATE') return;

    const {
      o: { X: status, o: otype, c: coid },
    } = wsresp;

    if (status === 'EXPIRED' && otype === 'STOP') {
      uws.eventEmitter.emit(coid, coid);
    }
  },
};

module.exports = uws;
