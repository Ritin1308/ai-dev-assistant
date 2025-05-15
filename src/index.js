const express = require('express');
const repoRoutes = require('./routes/repoRoutes'); // Corrected path

const app = express();
const PORT = 5000;

app.use(express.json());
app.use('/api', repoRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
