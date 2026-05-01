const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDatabase = require('./config/db');
const vehicleRoutes = require('./routes/vehicles');
const maintenanceRoutes = require('./routes/maintenances');

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

connectDatabase();

app.get('/', (req, res) => {
  res.json({ message: 'Agendacar API está rodando' });
});

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/maintenances', maintenanceRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
