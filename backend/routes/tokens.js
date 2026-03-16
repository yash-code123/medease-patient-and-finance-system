const router = require('express').Router();
const Token  = require('../models/Token');
const auth   = require('../middleware/auth');
const guard  = require('../middleware/roleGuard');

router.get('/', auth, async (req, res) => {
  try {
    const where = req.user.role === 'doctor'
      ? { status: { [require('sequelize').Op.ne]: 'Done' } }
      : {};
    res.json(await Token.findAll({ where, order: [['createdAt','ASC']] }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    await Token.update({ status: req.body.status }, { where: { id: req.params.id } });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
