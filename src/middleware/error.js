
const errorHandler = (err, req, res, next) => {
   
    console.log('🔥 ERROR HANDLER ACTIVADO');
   
    const status = err.status || 500;

    res.status(status).json({
        message: err.message
    });
};

export default errorHandler;