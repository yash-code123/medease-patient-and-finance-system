const router = require('express').Router();
const Doctor = require('../models/Doctor');
const User   = require('../models/User');
const bcrypt = require('bcryptjs');
const auth   = require('../middleware/auth');
const guard  = require('../middleware/roleGuard');

router.get('/', auth, async (req, res) => {
  try { res.json(await Doctor.findAll()); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, guard('admin'), async (req, res) => {
  try {
    const count = await Doctor.count();
    const id = 'D-' + (100 + count + 1);
    const doc = await Doctor.create({ id, ...req.body });

    // Auto-create login
    const parts = req.body.name.replace(/^Dr\.\s*/i,'').toLowerCase().split(' ');
    const username = 'dr.' + (parts[0]||'doctor') + (parts[1] ? '.'+parts[1] : '');
    const password = await bcrypt.hash('doc@' + (req.body.phone||'0000').slice(-4), 10);
    await User.create({ username, password, role: 'doctor', name: req.body.name, ref_id: id });

    res.status(201).json({ doctor: doc, username, tempPassword: 'doc@' + (req.body.phone||'0000').slice(-4) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, guard('admin'), async (req, res) => {
  try { await Doctor.update(req.body, { where: { id: req.params.id } }); res.json({ message: 'Updated' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, guard('admin'), async (req, res) => {
  try { await Doctor.destroy({ where: { id: req.params.id } }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
