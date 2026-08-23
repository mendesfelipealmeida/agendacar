const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: String, trim: true },
  ownerName: { type: String, trim: true },
  licensePlate: { type: String, trim: true, uppercase: true },
  mileage: { type: Number, default: 0, min: 0 },
  area: { type: String, enum: ['client', 'mechanic'], default: 'client' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
