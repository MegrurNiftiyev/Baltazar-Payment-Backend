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

  listTestCards = catchAsync(async (req, res) => {
    const result = paymentService.listTestCards();
    return res.status(200).json(result);
  });


  resetAllMethods = catchAsync(async (req, res) => {
    const result = paymentService.resetAllMethods();
    return res.status(200).json(result);
  });
}

module.exports = new PaymentController();

