const express = require('express');
const Mechanic = require('../models/mechanic');
const ServiceOrder = require('../models/serviceOrder');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.active = true;
    if (req.query.active === 'false') filter.active = false;

    const mechanics = await Mechanic.find(filter).sort({ active: -1, name: 1 });
    res.json(mechanics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, role, phone, active } = req.body;

    if (!name?.trim() || !role?.trim()) {
      return res.status(400).json({ message: 'Nome e funcao sao obrigatorios' });
    }

    const mechanic = new Mechanic({
      name: name.trim(),
      role: role.trim(),
      phone: phone?.trim() || '',
      active: active !== undefined ? Boolean(active) : true,
    });

    const saved = await mechanic.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) return res.status(404).json({ message: 'Mecanico nao encontrado' });
    res.json(mechanic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = {};
    ['name', 'role', 'phone'].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = String(req.body[field]).trim();
    });
    if (req.body.active !== undefined) updates.active = Boolean(req.body.active);

    if (updates.name === '' || updates.role === '') {
      return res.status(400).json({ message: 'Nome e funcao sao obrigatorios' });
    }

    const mechanic = await Mechanic.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!mechanic) return res.status(404).json({ message: 'Mecanico nao encontrado' });
    res.json(mechanic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const mechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      { active: Boolean(req.body.active) },
      { new: true },
    );

    if (!mechanic) return res.status(404).json({ message: 'Mecanico nao encontrado' });
    res.json(mechanic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const hasHistory = await ServiceOrder.exists({ 'services.mechanic': req.params.id });

    if (hasHistory) {
      const mechanic = await Mechanic.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
      if (!mechanic) return res.status(404).json({ message: 'Mecanico nao encontrado' });
      return res.json({
        message: 'Mecanico possui historico e foi desativado.',
        mechanic,
      });
    }

    const mechanic = await Mechanic.findByIdAndDelete(req.params.id);
    if (!mechanic) return res.status(404).json({ message: 'Mecanico nao encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
