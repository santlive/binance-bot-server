const _ = require('lodash');
const Order = require('../Utils/order');

let orders = {
  data: [],
  addOrder(pl) {
    orders.data.push(new Order(pl));
  },
  deleteCompleted() {
    const deletebefore = Date.now() - 7 * 24 * 60 * 60 * 1000;
    _.remove(
      orders.data,
      (o) =>
        !['INIT', 'PENDING'].includes(o.status) && o.triggerTS < deletebefore
    );
  },
  async deleteOrder({ orderID }) {
    const sOrder = orders.data.find((o) => o.orderID === orderID);
    if (!sOrder) return 'Incorret Order ID';

    const resp = await sOrder.deleteOrder();
    if (resp === 'success') {
      orders.data = orders.data.filter((o) => o.orderID != orderID);
    }
    return resp;
  },
  // loadTempData() {
  //   orders.data = [
  //     {
  //       orderID: '12345',
  //       symbol: 'BTCUSDT',
  //       quantity: '0.001',
  //       lentryprice: '9654.23',
  //       lexitprice: '9754.43',
  //       lslprice: '9876.76',
  //       sentryprice: '9456.75',
  //       sexitprice: '9563.23',
  //       sslprice: '9865.43',
  //       status: 'INIT',
  //       lentrycoid: 'ABCD1234',
  //       lexitcoid: 'ALKDFHJAL',
  //       lslcoid: 'FASDKLHJF',
  //       sentrycoid: 'ALSFKDHJ',
  //       sexitcoid: 'DFSADFSSA',
  //       sslcoid: 'ASDFASDF',
  //       messages: [
  //         { type: 'S', message: 'Long entry successful!' },
  //         {
  //           type: 'E',
  //           message:
  //             'Long entry failure! Reason: sldfjasfhlafhlfhlajhfldasjhlsdj',
  //         },
  //         { type: 'S', message: 'Short entry successful!' },
  //       ],
  //       openTS: 1562056540743,
  //       triggerTS: 1592056540743,
  //       lcdnprice: '8765.23',
  //       scdnprice: '7865.23',
  //     },
  //     {
  //       orderID: '56432',
  //       symbol: 'XRPUSDT',
  //       quantity: '0.001',
  //       lentryprice: '9654.23',
  //       lexitprice: '9754.43',
  //       lslprice: '9876.76',
  //       sentryprice: '9456.75',
  //       sexitprice: '9563.23',
  //       sslprice: '9865.43',
  //       status: 'LT',
  //       lentrycoid: 'ABCD1234',
  //       lexitcoid: 'ALKDFHJAL',
  //       lslcoid: 'FASDKLHJF',
  //       sentrycoid: 'ALSFKDHJ',
  //       sexitcoid: 'DFSADFSSA',
  //       sslcoid: 'ASDFASDF',
  //       messages: [
  //         { type: 'S', message: 'Short entry successful!' },
  //         {
  //           type: 'E',
  //           message:
  //             'Short entry failure! Reason: sldfjasfhlafhlfhlajhfldasjhlsdj',
  //         },
  //         { type: 'S', message: 'Long entry successful!' },
  //       ],
  //       openTS: 1532056540743,
  //       triggerTS: 1592056540743,
  //       lcdnprice: '8765.23',
  //       scdnprice: '7865.23',
  //     },
  //     {
  //       orderID: '34567',
  //       symbol: 'XRPUSDT',
  //       quantity: '0.001',
  //       lentryprice: '9654.23',
  //       lexitprice: '9754.43',
  //       lslprice: '9876.76',
  //       sentryprice: '9456.75',
  //       sexitprice: '9563.23',
  //       sslprice: '9865.43',
  //       status: 'PENDING',
  //       lentrycoid: 'ABCD1234',
  //       lexitcoid: 'ALKDFHJAL',
  //       lslcoid: 'FASDKLHJF',
  //       sentrycoid: 'ALSFKDHJ',
  //       sexitcoid: 'DFSADFSSA',
  //       sslcoid: 'ASDFASDF',
  //       messages: [
  //         { type: 'S', message: 'Short entry successful!' },
  //         {
  //           type: 'E',
  //           message:
  //             'Short entry failure! Reason: sldfjasfhlafhlfhlajhfldasjhlsdj',
  //         },
  //         { type: 'S', message: 'Long entry successful!' },
  //       ],
  //       openTS: 1565056540743,
  //       lcdnprice: '8765.23',
  //       scdnprice: '7865.23',
  //     },
  //   ];
  // },
};

module.exports = orders;
