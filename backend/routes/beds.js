const router = require('express').Router();
const Bed    = require('../models/Bed');
const auth   = require('../middleware/auth');
const guard  = require('../middleware/roleGuard');

router.get('/',    auth, async (req,res) => { try{ res.json(await Bed.findAll()); }catch(e){res.status(500).json({message:e.message}); }});
router.put('/:id', auth, guard('admin'), async (req,res) => { try{ await Bed.update(req.body,{where:{id:req.params.id}}); res.json({message:'Updated'}); }catch(e){res.status(500).json({message:e.message});}});

module.exports = router;
