const api = require('binance');
const scientificToDecimal = require('scientific-to-decimal');
const axios = require('axios');
const log = console.log;

let tickStatic = {
  data: {},
  getData: () => {
    log('TickStatic triggered!');

    axios('https://fapi.binance.com/fapi/v1/exchangeInfo')
      .then((resp) => {
        tickStatic.data = resp.data.symbols.reduce((a, d) => {
          const price = Math.log10(1 / parseFloat(d['filters'][0]['tickSize']));
          const quantity = Math.log10(
            1 / parseFloat(d['filters'][1]['stepSize'])
          );
          const minQty = parseFloat(d['filters'][2]['minQty']);
          const den = d['quoteAsset'];
          const num = d['baseAsset'];
          const tickSize = parseFloat(d['filters'][0]['tickSize']);
          a[d.symbol] = { price, quantity, minQty, den, num, tickSize };
          return a;
        }, {});
      })
      .catch((err) => {
        log(err);
      });
  },
  NormalizePrice: ({ price, symbol }) => {
    const lv_pricestepsize = tickStatic.data[symbol]['price'];
    const lv_p1Num = scientificToDecimal(price);
    let lv_p1String = lv_p1Num + '';
    const lv_inxdec = lv_p1String.indexOf('.');
    if (lv_inxdec === -1) {
      return price;
    } else {
      lv_p1String = lv_p1String.substring(0, lv_inxdec + lv_pricestepsize + 1);
      return parseFloat(lv_p1String);
    }
  },
  NormalizeQty: ({ quantity, symbol }) => {
    const lv_qtystepsize = tickStatic.data[symbol]['quantity'];
    const lv_q1Num = scientificToDecimal(quantity);
    let lv_q1String = lv_q1Num + '';
    const lv_inxdec = lv_q1String.indexOf('.');
    if (lv_inxdec === -1) {
      return quantity;
    } else {
      lv_q1String = lv_q1String.substring(0, lv_inxdec + lv_qtystepsize + 1);
      return parseFloat(lv_q1String);
    }
  },
};

module.exports = tickStatic;
