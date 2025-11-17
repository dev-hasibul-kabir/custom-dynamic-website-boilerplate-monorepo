require('dotenv').config();

const express = require('express');
const next = require('next');

const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT) || 4567;
const dev = process.env.NODE_ENV === 'development';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
    .then(() => {
        const server = express();

        server.all('*', (req, res) => handle(req, res));

        server.listen(port, host, error => {
            if (error) throw error;

            console.debug(`> Ready on http://${host}:${port}`);
        });
    })
    .catch(error => {
        console.error('server.js', error);
    });
