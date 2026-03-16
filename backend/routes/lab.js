const router   = require('express').Router();
const LabOrder = require('../models/LabOrder');
const auth     = require('../middleware/auth');
const guard    = require('../middleware/roleGuard');

router.get('/', auth, async (req, res) => {
  try {
    const where = req.user.role === 'patient' ? { patient_id: req.user.ref_id } : {};
    res.json(await LabOrder.findAll({ where, order: [['createdAt','DESC']] }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, guard('doctor','admin'), async (req, res) => {
  try {
    const count = await LabOrder.count();
    const id = 'L-' + (7000 + count + 1);
    const lab = await LabOrder.create({ id, ...req.body });
    res.status(201).json(lab);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/result', auth, guard('admin'), async (req, res) => {
  try {
    await LabOrder.update({ result: req.body.result, status: 'Done' }, { where: { id: req.params.id } });
    res.json({ message: 'Result saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
