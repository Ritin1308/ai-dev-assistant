const express = require('express');
const cors = require('cors');
const repoRoutes = require('./routes/repoRoutes');
require('dotenv').config();

const app = express();
const PORT = 5001; // Changed to 5001 to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', repoRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});