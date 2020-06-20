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
};

module.exports = orders;
