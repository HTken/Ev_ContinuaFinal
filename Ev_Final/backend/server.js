import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dishesRouter from './src/routes/dishes.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.get('/api/health', (_req, res) => res.json({ status: 'ok', at: new Date().toISOString() }));
app.use('/api/dishes', dishesRouter);


app.use(express.static(path.join(__dirname, 'public')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Error MongoDB:', err.message);
    process.exit(1);
  });
