const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const Patient = require('../models/Patient');

// ── POST /api/auth/login ──────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name, ref_id: user.ref_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name, ref_id: user.ref_id } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/signup (patient self-register) ────
router.post('/signup', [
  body('fname').notEmpty().trim(),
  body('lname').notEmpty().trim(),
  body('phone').isLength({ min: 10, max: 10 }),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { fname, lname, dob, gender, blood, phone, email, password } = req.body;

    // Generate patient ID
    const count = await Patient.count();
    const patId = 'P-' + (1000 + count + 1);

    // Check username taken
    const exists = await User.findOne({ where: { username: patId } });
    if (exists) return res.status(400).json({ message: 'Please try again.' });

    const hashed = await bcrypt.hash(password, 10);
    const today = new Date().toISOString().split('T')[0];

    await Patient.create({ id: patId, fname, lname, dob, gender, blood, phone, email, aadhaar: '', address: '', allergies: 'None', emergency: '', registered: today });
    await User.create({ username: patId, password: hashed, role: 'patient', name: `${fname} ${lname}`, ref_id: patId });

    res.status(201).json({ message: 'Account created!', patientId: patId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
