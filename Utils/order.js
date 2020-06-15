const fetch = require('./fetch');
const _ = require('lodash');
const orderE = require('./orderE');
const log = console.log;

class Order {
  constructor(pl) {
    Object.assign(this, pl);
    this.openTS = Date.now();
    this.placeorders();
  }
  async deleteOrder() {
    try {
      if (!['INIT', 'PENDING'].includes(this.status)) return;
      //cancel short side orders.
      //place a stoploss order on the long side.
      this.status = 'CANCEL';
      require(`../Components/uws`).eventEmitter.removeListener(
        this.lentrycoid,
        this.callbackFnL
      );

      require(`../Components/uws`).eventEmitter.removeListener(
        this.sentrycoid,
        this.callbackFnS
      );

      const rtypeC = 'cancelMultipleFutures';
      const { symbol, lentrycoid, lexitcoid, sentrycoid, sexitcoid } = this;
      const origClientOrderIdList = JSON.stringify([
        lentrycoid,
        lexitcoid,
        sentrycoid,
        sexitcoid,
      ]);
      const funcparC = { symbol, origClientOrderIdList };
      const resp = await fetch({ rtype: rtypeC, funcpar: funcparC });
      return resp;
    } catch (err) {
      this.status = 'ERROR';
      log(err);
      orderE.emitOrderUpdates(this);
      return err;
    }
  }
  async placeorders() {
    try {
      const rtype = 'newOrderFutures';
      const {
        symbol,
        quantity,
        lentryprice,
        lentrycoid,
        lcdnprice,
        lexitprice,
        lexitcoid,
        sentryprice,
        sentrycoid,
        scdnprice,
        sexitprice,
        sexitcoid,
      } = this;

      const funcpar_lentry = {
        symbol,
        side: 'BUY',
        type: 'STOP',
        timeInForce: 'GTC',
        quantity,
        stopPrice: lcdnprice,
        price: lentryprice,
        newClientOrderId: lentrycoid,
      };

      const funcpar_lexit = {
        symbol,
        side: 'SELL',
        type: 'TAKE_PROFIT_MARKET',
        quantity,
        stopPrice: lexitprice,
        newClientOrderId: lexitcoid,
        reduceOnly: true,
      };

      const funcpar_sentry = {
        symbol,
        side: 'SELL',
        type: 'STOP',
        timeInForce: 'GTC',
        quantity,
        stopPrice: scdnprice,
        price: sentryprice,
        newClientOrderId: sentrycoid,
      };

      const funcpar_sexit = {
        symbol,
        side: 'BUY',
        type: 'TAKE_PROFIT_MARKET',
        quantity,
        stopPrice: sexitprice,
        newClientOrderId: sexitcoid,
        reduceOnly: true,
      };

      this.callbackFnL = _.bind(this.triggerHandlerL, this);
      this.callbackFnS = _.bind(this.triggerHandlerS, this);

      require(`../Components/uws`).eventEmitter.on(
        this.lentrycoid,
        this.callbackFnL
      );

      require(`../Components/uws`).eventEmitter.on(
        this.sentrycoid,
        this.callbackFnS
      );

      const lentry = fetch({ rtype, funcpar: funcpar_lentry });
      const lexit = fetch({ rtype, funcpar: funcpar_lexit });
      const sentry = fetch({ rtype, funcpar: funcpar_sentry });
      const sexit = fetch({ rtype, funcpar: funcpar_sexit });

      const resp = await Promise.all([lentry, lexit, sentry, sexit]);
      const sm = ['Long entry', 'Long exit', 'Short entry', 'Short exit'];
      const messages = resp.map((d, i) => {
        return d === 'success'
          ? { type: 'S', message: `${sm[i]} successful!` }
          : { type: 'E', message: `${sm[i]} failure! Reason:${d}` };
      });
      this.messages = [...this.messages, ...messages];
      this.status = 'PENDING';
      orderE.emitOrderUpdates(this);
    } catch (err) {
      this.status = 'ERROR';
      orderE.emitOrderUpdates(this);
    }
  }
  async triggerHandlerL(coid) {
    try {
      if (this.status != 'PENDING') return;
      //cancel short side orders.
      //place a stoploss order on the long side.
      this.status = 'LT';
      this.triggerTS = Date.now();
      require(`../Components/uws`).eventEmitter.removeListener(
        this.lentrycoid,
        this.callbackFnL
      );

      require(`../Components/uws`).eventEmitter.removeListener(
        this.sentrycoid,
        this.callbackFnS
      );

      const rtypeC = 'cancelMultipleFutures';
      const {
        symbol,
        quantity,
        sentrycoid,
        sexitcoid,
        lslcoid,
        lslprice,
      } = this;
      const origClientOrderIdList = JSON.stringify([sentrycoid, sexitcoid]);
      const funcparC = { symbol, origClientOrderIdList };

      const rtypeS = 'newOrderFutures';
      const funcparS = {
        symbol,
        side: 'SELL',
        type: 'STOP_MARKET',
        quantity,
        stopPrice: lslprice,
        newClientOrderId: lslcoid,
        reduceOnly: true,
      };

      const cancelShort = fetch({ rtype: rtypeC, funcpar: funcparC });
      const slossOrder = fetch({ rtype: rtypeS, funcpar: funcparS });

      const resp = await Promise.all([cancelShort, slossOrder]);
      const sm = ['Short Cancel Orders', 'Long Sloss Order'];
      const messages = resp.map((d, i) => {
        return d === 'success'
          ? { type: 'S', message: `${sm[i]} successful!` }
          : { type: 'E', message: `${sm[i]} failure! Reason:${d}` };
      });
      this.messages = [...this.messages, ...messages];
      orderE.emitOrderUpdates(this);
    } catch (err) {
      this.status = 'ERROR';
      log(err);
      orderE.emitOrderUpdates(this);
    }
  }
  async triggerHandlerS(coid) {
    try {
      if (this.status != 'PENDING') return;
      //cancel short side orders.
      //place a stoploss order on the long side.
      this.status = 'ST';
      this.triggerTS = Date.now();

      require(`../Components/uws`).eventEmitter.removeListener(
        this.lentrycoid,
        this.callbackFnL
      );

      require(`../Components/uws`).eventEmitter.removeListener(
        this.sentrycoid,
        this.callbackFnS
      );

      const rtypeC = 'cancelMultipleFutures';
      const {
        symbol,
        quantity,
        lentrycoid,
        lexitcoid,
        sslcoid,
        sslprice,
      } = this;
      const origClientOrderIdList = JSON.stringify([lentrycoid, lexitcoid]);
      const funcparC = { symbol, origClientOrderIdList };

      const rtypeS = 'newOrderFutures';
      const funcparS = {
        symbol,
        side: 'BUY',
        type: 'STOP_MARKET',
        quantity,
        stopPrice: sslprice,
        newClientOrderId: sslcoid,
        reduceOnly: true,
      };

      const cancelShort = fetch({ rtype: rtypeC, funcpar: funcparC });
      const slossOrder = fetch({ rtype: rtypeS, funcpar: funcparS });

      const resp = await Promise.all([cancelShort, slossOrder]);
      const sm = ['Long Cancel Orders', 'Short Sloss Order'];
      const messages = resp.map((d, i) => {
        return d === 'success'
          ? { type: 'S', message: `${sm[i]} successful!` }
          : { type: 'E', message: `${sm[i]} failure! Reason:${d}` };
      });
      this.messages = [...this.messages, ...messages];
      orderE.emitOrderUpdates(this);
    } catch (err) {
      this.status = 'ERROR';
      log(err);
      orderE.emitOrderUpdates(this);
    }
  }
}

module.exports = Order;
