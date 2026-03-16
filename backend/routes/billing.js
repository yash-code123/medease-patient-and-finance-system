const router = require('express').Router();
const Bill   = require('../models/Bill');
const auth   = require('../middleware/auth');
const guard  = require('../middleware/roleGuard');

router.get('/', auth, async (req, res) => {
  try {
    const where = req.user.role === 'patient' ? { patient_id: req.user.ref_id } : {};
    res.json(await Bill.findAll({ where, order: [['date','DESC']] }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, guard('admin'), async (req, res) => {
  try {
    const count = await Bill.count();
    const id = 'B-' + (3000 + count + 1);
    const bill = await Bill.create({ id, ...req.body });
    res.status(201).json(bill);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
