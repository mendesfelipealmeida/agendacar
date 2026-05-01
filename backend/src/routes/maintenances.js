const express = require('express');
const Maintenance = require('../models/maintenance');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = req.query.area ? { area: req.query.area } : {};
    const items = await Maintenance.find(filter).populate('vehicle').sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const maintenance = new Maintenance(req.body);
    const saved = await maintenance.save();
    await saved.populate('vehicle');
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Maintenance.findById(req.params.id).populate('vehicle');
    if (!item) return res.status(404).json({ message: 'Registro nao encontrado' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('vehicle');
    if (!item) return res.status(404).json({ message: 'Registro nao encontrado' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Maintenance.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Registro nao encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
