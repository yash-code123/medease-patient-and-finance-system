const router   = require('express').Router();
const Medicine = require('../models/Medicine');
const auth     = require('../middleware/auth');
const guard    = require('../middleware/roleGuard');

router.get('/',     auth, async (req, res) => { try { res.json(await Medicine.findAll()); } catch(e){ res.status(500).json({message:e.message}); }});
router.post('/',    auth, guard('admin'), async (req,res) => { try { const c=await Medicine.count(); const m=await Medicine.create({id:'M-'+(8000+c+1),...req.body}); res.status(201).json(m); } catch(e){res.status(500).json({message:e.message});}});
router.put('/:id',  auth, guard('admin'), async (req,res) => { try { await Medicine.update(req.body,{where:{id:req.params.id}}); res.json({message:'Updated'}); } catch(e){res.status(500).json({message:e.message});}});

module.exports = router;
