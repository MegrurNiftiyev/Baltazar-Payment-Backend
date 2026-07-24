const express = require('express');
const cors = require('cors');
const { ensureCardsFile } = require('./utils/cardStore');
const mockBankRoutes = require('./routes/mockBank');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize card data (copy seed → cards.json if needed)
ensureCardsFile();

// Routes
app.use('/api/mock-bank', mockBankRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'Mock Bank Test API',
    version: '1.0.0',
    endpoints: [
      'POST /api/mock-bank/tokenize',
      'POST /api/mock-bank/charge',
      'GET  /api/mock-bank/cards',
      'POST /api/mock-bank/cards/:paymentMethodId/reset-balance'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏦 Mock Bank API running on http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   POST /api/mock-bank/tokenize`);
  console.log(`   POST /api/mock-bank/charge`);
  console.log(`   GET  /api/mock-bank/cards`);
  console.log(`   POST /api/mock-bank/cards/:paymentMethodId/reset-balance\n`);
});
