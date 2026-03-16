const router       = require('express').Router();
const Prescription = require('../models/Prescription');
const auth         = require('../middleware/auth');
const guard        = require('../middleware/roleGuard');

router.get('/', auth, async (req, res) => {
  try {
    const where = req.user.role === 'patient' ? { patient_id: req.user.ref_id } : {};
    res.json(await Prescription.findAll({ where, order: [['date','DESC']] }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, guard('doctor','admin'), async (req, res) => {
  try {
    const count = await Prescription.count();
    const id = 'Rx-' + (5000 + count + 1);
    const rx = await Prescription.create({ id, ...req.body });
    res.status(201).json(rx);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
