require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const sequelize = require('./config/db');

const app = express();

// ── Middleware ───────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());

// ── Health check ─────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'MedEase API running 🏥', version: '1.0.0' }));
app.get('/health', (req, res) => res.json({ ok: true }));

// ── Routes ────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/patients',      require('./routes/patients'));
app.use('/api/doctors',       require('./routes/doctors'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/tokens',        require('./routes/tokens'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/lab',           require('./routes/lab'));
app.use('/api/billing',       require('./routes/billing'));
app.use('/api/pharmacy',      require('./routes/pharmacy'));
app.use('/api/beds',          require('./routes/beds'));

// ── 404 handler ──────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL connected');
    return sequelize.sync({ alter: true });  // syncs schema without dropping data
  })
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 MedEase API running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
