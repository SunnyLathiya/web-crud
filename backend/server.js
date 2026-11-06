const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/sockets/chatSocket');
const seedAdmin = require('./src/utils/seedAdmin');

const port = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Copy backend/.env.example to backend/.env.');
  }

  await connectDB();
  await seedAdmin();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    console.log(`WebChat API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
