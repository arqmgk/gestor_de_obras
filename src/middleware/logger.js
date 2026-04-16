import chalk from 'chalk';

const colors = {
    GET: chalk.green,
    POST: chalk.blue,
    PUT: chalk.yellow,
    DELETE: chalk.red
};

const logger = (req, res, next) => {
    const color = colors[req.method] || chalk.white;

    console.log(
        `[${new Date().toISOString()}] ${color(req.method)} ${req.originalUrl}`
    );

    next();
};

export default logger;
