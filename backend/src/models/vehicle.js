const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String },
  ownerName: { type: String },
  licensePlate: { type: String },
  mileage: { type: Number, default: 0 },
  area: { type: String, enum: ['client', 'mechanic'], default: 'client' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
