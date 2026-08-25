const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'RECEBIDO',
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'EM_MANUTENCAO',
  'FINALIZANDO',
  'PRONTO',
  'ENTREGUE',
  'CANCELADO',
];

const SERVICE_STATUSES = [
  'PENDENTE',
  'EM_ANDAMENTO',
  'CONCLUIDO',
  'CANCELADO',
];

const auditEventSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const serviceOrderItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic' },
  mechanicName: { type: String, trim: true },
  mechanicRole: { type: String, trim: true },
  status: { type: String, enum: SERVICE_STATUSES, default: 'PENDENTE' },
  notes: { type: String, trim: true },
  startedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

const serviceOrderSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true, trim: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  vehicleSnapshot: {
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: String, trim: true },
    licensePlate: { type: String, trim: true },
  },
  customerName: { type: String, required: true, trim: true },
  entryAt: { type: Date, default: Date.now },
  entryMileage: { type: Number, min: 0, default: 0 },
  customerNotes: { type: String, trim: true },
  status: { type: String, enum: ORDER_STATUSES, default: 'RECEBIDO' },
  services: [serviceOrderItemSchema],
  completedAt: { type: Date },
  internalNotes: { type: String, trim: true },
  auditEvents: [auditEventSchema],
  area: { type: String, enum: ['mechanic'], default: 'mechanic' },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ServiceOrder', serviceOrderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.SERVICE_STATUSES = SERVICE_STATUSES;
