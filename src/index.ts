import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { connectRedis } from './config/redis';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = config.port;

// Connect to Redis
connectRedis();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (replace with specific domains in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
