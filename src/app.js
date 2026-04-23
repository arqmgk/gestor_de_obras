import express from 'express';
import cors from 'cors';
import path from 'path';
import obrasRoutes from './routes_crud/obras.js';
import tasksRoutes from './routes_crud/tasks.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import notFound from './middleware/notFound.js';

const app = express();

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS — necesario para el frontend React

app.use(cors({ origin: 'http://localhost:5173' }));
// logger
app.use(logger);
app.use(express.static(path.join(process.cwd(), 'public')));

// rutas
app.use('/api/obras', obrasRoutes);
app.use('/api/tasks', tasksRoutes);

// 404
app.use(notFound);

// error handler
app.use(errorHandler);

export default app;