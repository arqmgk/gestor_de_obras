import { Router } from 'express';
import {getTasks, getTask, createTask, updateTask,deleteTask, getProgresoTask, addMedicion, getMediciones } from '../controllers/tasksControllers.js';



const router = Router();



// GET todos
router.get('/', getTasks);

//GET mediciones
router.get('/:id/mediciones', getMediciones);


//POST mediciones
router.post('/:id/mediciones', addMedicion);


//GET por avance
router.get('/:id/progreso', getProgresoTask);


// GET por id
router.get('/:id', getTask);

// POST crear
router.post('/', createTask);


//Update a post
router.put('/:id', updateTask);


//DELETE POST
router.delete('/:id', deleteTask);




export default router;
