const errorHandler = (err, req, res, next) => {
    res.status(404).json({message: 'Error'});
}

export default errorHandler;