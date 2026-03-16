const router  = require('express').Router();
const Patient = require('../models/Patient');
const auth    = require('../middleware/auth');
const guard   = require('../middleware/roleGuard');

// GET all patients (admin/doctor only)
router.get('/', auth, guard('admin','doctor'), async (req, res) => {
  try {
    const patients = await Patient.findAll({ order: [['registered','DESC']] });
    res.json(patients);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single patient
router.get('/:id', auth, async (req, res) => {
  try {
    const p = await Patient.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'Patient not found' });
    // Patients can only view their own record
    if (req.user.role === 'patient' && req.user.ref_id !== req.params.id)
      return res.status(403).json({ message: 'Access denied' });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST register new patient (admin only)
router.post('/', auth, guard('admin'), async (req, res) => {
  try {
    const count = await Patient.count();
    const id = 'P-' + (1000 + count + 1);
    const today = new Date().toISOString().split('T')[0];
    const p = await Patient.create({ id, ...req.body, registered: today });
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update patient
router.put('/:id', auth, guard('admin'), async (req, res) => {
  try {
    await Patient.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE patient
router.delete('/:id', auth, guard('admin'), async (req, res) => {
  try {
    await Patient.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
