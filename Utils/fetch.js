const Bottleneck = require('bottleneck');
const axios = require('axios');
const api = require('binance');

//15 requests per sec - 900 requests per minute.
const limiter = new Bottleneck({
  reservoir: 15, // initial value
  reservoirRefreshAmount: 15,
  reservoirRefreshInterval: 1000,
  maxConcurrent: 10,
  minTime: 1000,
});

const fetch = async ({ rtype, funcpar }) => {
  try {
    const { APIKEY, SECKEY } = process.env;
    const bRest = new api.BinanceRest({
      key: APIKEY,
      secret: SECKEY,
      timeout: 15000,
      recvWindow: 20000,
      disableBeautification: false,
      handleDrift: true,
    });
    const resp = funcpar ? await bRest[rtype](funcpar) : await bRest[rtype]();
    if (['startUserDataStreamFutures'].includes(rtype)) {
      return resp;
    }
    return 'success';
  } catch (err) {
    throw JSON.stringify(err);
  }
};

module.exports = limiter.wrap(fetch);
