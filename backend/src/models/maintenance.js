const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: { type: String, required: true, trim: true },
  workshopName: { type: String, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  mileage: { type: Number, min: 0 },
  nextServiceAt: { type: Number, min: 0 },
  area: { type: String, enum: ['client', 'mechanic'], default: 'client' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
