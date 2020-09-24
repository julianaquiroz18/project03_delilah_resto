require('dotenv').config();
const express = require('express');
const { ValidationError } = require('express-json-validator-middleware');
const { initDatabase } = require('./database');
const { router } = require('./routes/routes.js');
const PORT = 9091;

async function main() {
    const server = express();
    server.use(express.json());
    server.use('/delilah/v1', router);

    server.use(function(err, req, res, next) {
        if (err instanceof ValidationError) {
            res.status(400).send({
                code: 400,
                error: 'Invalid input'
            });
            next();
        } else {
            res.status(err.status).send({
                code: err.status,
                error: err.message,
                //body: err.body || ""
            });
            next();
        }
    })

    const sequalize = await initDatabase();
    server.listen(PORT, () => {
        console.log(`Server is UP via port ${PORT}...`);
    });
}

main();