import express from 'express';
import path from 'path'; 
import obrasRoutes from './routes_crud/obras.js';
import tasksRoutes from './routes_crud/tasks.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import notFound from './middleware/Notfound.js';

const app = express();


//body parser middleware

app.use(express.json());
app.use(express.urlencoded({extended: false}));

//Logger middleware
app.use(logger);
app.use(express.static(path.join(process.cwd(), 'public')));

// rutas
app.use('/api/obras', obrasRoutes);
app.use('/api/tasks', tasksRoutes);


//404
app.use(notFound);

//Error Handler

app.use(errorHandler);

export default app;

