const express = require('express');
const router = express.Router();
const {
  postorderRules,
  deleteorderRules,
  validate,
} = require('../Utils/validator');
const orders = require('../Components/orders');

// @route   POST /order
// @desc    Add a new order
// @payload {}//will paste later
router.post('/', postorderRules(), validate, (req, res) => {
  orders.addOrder({ ...req.body });
  res.sendStatus(200);
});

// @route   DELETE /order
// @desc    Delete existing order
// @payload {}//will paste later
router.delete('/', deleteorderRules(), validate, async (req, res) => {
  const resp = await orders.deleteOrder({ ...req.body });
  if (resp === 'success') {
    res.status(200).send(resp);
  } else {
    res.status(400).send(resp);
  }
});

module.exports = router;
