const express = require('express');
const Mechanic = require('../models/mechanic');
const ServiceOrder = require('../models/serviceOrder');
const Vehicle = require('../models/vehicle');

const router = express.Router();

const ORDER_STATUSES = ServiceOrder.ORDER_STATUSES;
const SERVICE_STATUSES = ServiceOrder.SERVICE_STATUSES;

function normalizeNumber(value) {
  return String(value).padStart(5, '0');
}

async function generateOrderNumber() {
  const latest = await ServiceOrder.findOne().sort({ createdAt: -1 }).select('number');
  const latestNumber = Number.parseInt(latest?.number, 10);
  return normalizeNumber(Number.isFinite(latestNumber) ? latestNumber + 1 : 1);
}

function addAudit(order, type, description) {
  order.auditEvents.push({ type, description });
}

async function buildServiceItem(payload) {
  const description = payload.description?.trim();
  if (!description) {
    const error = new Error('Descricao do servico e obrigatoria');
    error.statusCode = 400;
    throw error;
  }

  const service = {
    description,
    status: payload.status || 'PENDENTE',
    notes: payload.notes?.trim() || '',
  };

  if (payload.mechanic) {
    const mechanic = await Mechanic.findById(payload.mechanic);
    if (!mechanic) {
      const error = new Error('Mecanico responsavel nao encontrado');
      error.statusCode = 404;
      throw error;
    }

    service.mechanic = mechanic._id;
    service.mechanicName = mechanic.name;
    service.mechanicRole = mechanic.role;
  }

  if (payload.startedAt) service.startedAt = payload.startedAt;
  if (payload.completedAt) service.completedAt = payload.completedAt;
  if (service.status === 'EM_ANDAMENTO' && !service.startedAt) service.startedAt = new Date();
  if (service.status === 'CONCLUIDO' && !service.completedAt) service.completedAt = new Date();

  return service;
}

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;

    const orders = await ServiceOrder.find(filter)
      .populate('vehicle')
      .populate('services.mechanic')
      .sort({ entryAt: -1, createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { vehicle: vehicleId, entryMileage, customerNotes, internalNotes, services } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: 'Veiculo e obrigatorio' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Veiculo nao encontrado' });

    const serviceItems = [];
    if (Array.isArray(services)) {
      for (const item of services) {
        serviceItems.push(await buildServiceItem(item));
      }
    }

    const order = new ServiceOrder({
      number: await generateOrderNumber(),
      vehicle: vehicle._id,
      vehicleSnapshot: {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
      },
      customerName: vehicle.ownerName || req.body.customerName || 'Cliente nao informado',
      entryAt: req.body.entryAt || new Date(),
      entryMileage: Number.parseInt(entryMileage, 10) || Number(vehicle.mileage) || 0,
      customerNotes: customerNotes?.trim() || '',
      internalNotes: internalNotes?.trim() || '',
      services: serviceItems,
    });

    addAudit(order, 'OS_CRIADA', `OS ${order.number} criada.`);
    serviceItems.forEach((item) => addAudit(order, 'SERVICO_ADICIONADO', `Servico adicionado: ${item.description}.`));

    const saved = await order.save();
    await saved.populate('vehicle');
    await saved.populate('services.mechanic');
    res.status(201).json(saved);
  } catch (error) {
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id)
      .populate('vehicle')
      .populate('services.mechanic');
    if (!order) return res.status(404).json({ message: 'Ordem de servico nao encontrada' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = {};
    ['customerName', 'customerNotes', 'internalNotes'].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = String(req.body[field]).trim();
    });
    if (req.body.entryMileage !== undefined) updates.entryMileage = Number.parseInt(req.body.entryMileage, 10) || 0;
    if (req.body.entryAt !== undefined) updates.entryAt = req.body.entryAt;

    const order = await ServiceOrder.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('vehicle').populate('services.mechanic');

    if (!order) return res.status(404).json({ message: 'Ordem de servico nao encontrada' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    if (!ORDER_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: 'Status de OS invalido' });
    }

    const order = await ServiceOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Ordem de servico nao encontrada' });

    const previousStatus = order.status;
    order.status = req.body.status;
    if (['PRONTO', 'ENTREGUE'].includes(order.status) && !order.completedAt) {
      order.completedAt = new Date();
    }
    if (!['PRONTO', 'ENTREGUE'].includes(order.status)) {
      order.completedAt = undefined;
    }
    addAudit(order, 'STATUS_ALTERADO', `Status alterado de ${previousStatus} para ${order.status}.`);

    await order.save();
    await order.populate('vehicle');
    await order.populate('services.mechanic');
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/services', async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Ordem de servico nao encontrada' });

    const service = await buildServiceItem(req.body);
    order.services.push(service);
    addAudit(order, 'SERVICO_ADICIONADO', `Servico adicionado: ${service.description}.`);

    await order.save();
    await order.populate('vehicle');
    await order.populate('services.mechanic');
    res.status(201).json(order);
  } catch (error) {
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

router.patch('/:id/services/:serviceId', async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Ordem de servico nao encontrada' });

    const service = order.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Servico da OS nao encontrado' });

    if (req.body.description !== undefined) service.description = String(req.body.description).trim();
    if (req.body.notes !== undefined) service.notes = String(req.body.notes).trim();
    if (req.body.status !== undefined) {
      if (!SERVICE_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ message: 'Status de servico invalido' });
      }
      service.status = req.body.status;
      if (service.status === 'EM_ANDAMENTO' && !service.startedAt) service.startedAt = new Date();
      if (service.status === 'CONCLUIDO' && !service.completedAt) service.completedAt = new Date();
      addAudit(
        order,
        service.status === 'CONCLUIDO' ? 'SERVICO_CONCLUIDO' : 'STATUS_SERVICO_ALTERADO',
        `Status do servico ${service.description} alterado para ${service.status}.`,
      );
    }

    if (req.body.mechanic !== undefined) {
      if (req.body.mechanic) {
        const mechanic = await Mechanic.findById(req.body.mechanic);
        if (!mechanic) return res.status(404).json({ message: 'Mecanico responsavel nao encontrado' });
        service.mechanic = mechanic._id;
        service.mechanicName = mechanic.name;
        service.mechanicRole = mechanic.role;
      } else {
        service.mechanic = undefined;
        service.mechanicName = '';
        service.mechanicRole = '';
      }
      addAudit(order, 'RESPONSAVEL_ALTERADO', `Responsavel alterado no servico ${service.description}.`);
    }

    await order.save();
    await order.populate('vehicle');
    await order.populate('services.mechanic');
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
