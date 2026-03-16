const router      = require('express').Router();
const Appointment = require('../models/Appointment');
const Token       = require('../models/Token');
const Bill        = require('../models/Bill');
const auth        = require('../middleware/auth');
const guard       = require('../middleware/roleGuard');
const { Op }      = require('sequelize');

// GET all (admin/doctor) or own (patient)
router.get('/', auth, async (req, res) => {
  try {
    const where = req.user.role === 'patient' ? { patient_id: req.user.ref_id } : {};
    res.json(await Appointment.findAll({ where, order: [['date','DESC'],['time','ASC']] }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST book appointment + create token + bill
router.post('/', auth, async (req, res) => {
  try {
    const { patient_id, patient_name, doctor_id, doctor_name, dept, date, time, type, notes, phone, fee, pay_mode, txn_id } = req.body;

    // Generate IDs
    const aCount = await Appointment.count();
    const apptId = 'A-' + (200 + aCount + 1);
    const tCount = await Token.count();
    const tokNum = String(tCount + 1).padStart(3,'0');
    const tokId  = 'T-' + tokNum;
    const bCount = await Bill.count();
    const billId = 'B-' + (3000 + bCount + 1);

    const appt = await Appointment.create({
      id: apptId, patient_id, patient_name, doctor_id, doctor_name,
      dept, date, time, type, notes, phone, fee, pay_mode, txn_id,
      pay_status: 'Paid', status: 'Confirmed'
    });

    const token = await Token.create({
      id: tokId, appointment_id: apptId, patient_id, patient_name,
      dept, doctor_name,
      priority: type === 'Emergency' ? 'Emergency' : 'Normal',
      status: 'Waiting',
      issued_at: time
    });

    await Bill.create({
      id: billId, patient_id, patient_name, appt_id: apptId,
      amount: fee, mode: pay_mode, txn_id, status: 'Paid', note: 'Appointment Fee',
      date: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ appointment: appt, token, billId });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH update status
router.patch('/:id/status', auth, guard('admin','doctor'), async (req, res) => {
  try {
    await Appointment.update({ status: req.body.status }, { where: { id: req.params.id } });
    res.json({ message: 'Status updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
