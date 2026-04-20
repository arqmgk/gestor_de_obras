


const errorHandler = (err, req, res, next) => {
    console.error('🔥 ERROR:', err.message);  // ← agregá esta línea
    const status = err.status || 500;
    res.status(status).json({
        message: err.message
    });
};

export default errorHandler;