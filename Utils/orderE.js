const E = require('events');

let orderE = {
  eventEmitter: new E().setMaxListeners(1000),
  emitOrderUpdates: (pl) => {
    const {
      placeorders,
      triggerHandlerL,
      triggerHandlerS,
      callbackFnL,
      callbackFnS,
      ...payload
    } = pl;
    orderE.eventEmitter.emit('ORDERUPDATE', payload);
  },
};

module.exports = orderE;
