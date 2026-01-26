const Quotation = require('../models/Quotation');

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
exports.getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate('client', 'name company')
      .populate({
        path: 'estimation',
        select: 'title totalCost currency ironTriangle'
      })
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single quotation
// @route   GET /api/quotations/:id
// @access  Private
exports.getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('client')
      .populate({
          path: 'estimation',
          populate: { path: 'requirement', select: 'title' }
      });

    if (!quotation) {
      return res.status(404).json({ msg: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quotation not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create new quotation
// @route   POST /api/quotations
// @access  Private
exports.createQuotation = async (req, res) => {
  const { estimation, client, validUntil } = req.body;

  try {
    const newQuotation = new Quotation({
      estimation,
      client,
      validUntil
    });

    const quotation = await newQuotation.save();
    res.json(quotation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update quotation status
// @route   PUT /api/quotations/:id
// @access  Private
exports.updateQuotation = async (req, res) => {
  const { status } = req.body;

  try {
    let quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ msg: 'Quotation not found' });
    }

    quotation.status = status || quotation.status;

    await quotation.save();
    res.json(quotation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quotation not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete quotation
// @route   DELETE /api/quotations/:id
// @access  Private
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ msg: 'Quotation not found' });
    }

    await quotation.deleteOne();
    res.json({ msg: 'Quotation removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quotation not found' });
    }
    res.status(500).send('Server Error');
  }
};
