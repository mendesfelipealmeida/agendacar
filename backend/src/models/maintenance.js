const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: { type: String, required: true },
  workshopName: { type: String },
  description: { type: String },
  date: { type: Date, default: Date.now },
  mileage: { type: Number },
  nextServiceAt: { type: Number },
  area: { type: String, enum: ['client', 'mechanic'], default: 'client' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
