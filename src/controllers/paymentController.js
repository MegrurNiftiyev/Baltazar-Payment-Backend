const paymentService = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync');

class PaymentController {
  tokenize = catchAsync(async (req, res) => {
    const result = paymentService.tokenize(req.body);
    return res.status(200).json(result);
  });

  charge = catchAsync(async (req, res) => {
    const result = paymentService.charge(req.body);
    return res.status(200).json(result);
  });

  listMethods = catchAsync(async (req, res) => {
    const result = paymentService.listMethods();
    return res.status(200).json(result);
  });

  resetMethod = catchAsync(async (req, res) => {
    const result = paymentService.resetMethod(req.params.paymentMethodId);
    return res.status(200).json(result);
  });
}

module.exports = new PaymentController();
