const { check, validationResult } = require('express-validator');
const postorderRules = () => {
  return [
    check('quantity', 'Quantity should be numeric value').isFloat(),
    check('lentryprice', 'Long Entry Price should be numeric value').isFloat(),
    check('lexitprice', 'Long Exit Price should be numeric value').isFloat(),
    check('lslprice', 'Long Sloss Price should be numeric value').isFloat(),
    check('sentryprice', 'Short Entry Price should be numeric value').isFloat(),
    check('sexitprice', 'Short Exit Price should be numeric value').isFloat(),
    check('sslprice', 'Short Sloss Price should be numeric value').isFloat(),
  ];
};

const deleteorderRules = () => {
  return [check('orderID', 'Order ID is required!').not().isEmpty()];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

module.exports = {
  postorderRules,
  deleteorderRules,
  validate,
};
