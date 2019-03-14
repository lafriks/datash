require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const HttpStatus = require('http-status-codes');
const WebSocket = require('ws');
const { handleWSConn } = require('./ws');
const router = require('./routes');
const logger = require('./logger');

const app = express();
const server = http.createServer(app);
const ws = new WebSocket.Server({ server, path: '/connect' });

ws.on('connection', handleWSConn);
ws.on('error', (err) => {
  logger.error(err);
});

app.use((req, res, next) => {
  logger.info(`${req.method.toUpperCase()} ${req.originalUrl}`);
  next();
});
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(process.env.DIST || 'dist'));
app.use('/', router);

app.use((req, res) => {
  res.status(HttpStatus.NOT_FOUND)
    .json({
      message: HttpStatus.getStatusText(HttpStatus.NOT_FOUND),
    });
});

// eslint-disable-next-line
app.use((err, req, res, next) => {
  let statusCode = err.status;
  let statusMessage = err.message;
  if (!statusCode) {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    statusMessage = HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  logger.error(`${statusCode}, ${err}`);

  res.status(statusCode);
  res.json({ message: statusMessage });
});

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3001;
server.listen(port, host, () => {
  logger.info(`Listening on ${host}:${port}`);
});
