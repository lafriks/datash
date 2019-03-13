require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const HttpStatus = require('http-status-codes');
const router = require('./routes');
const logger = require('./logger');

const app = express();

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
const port = process.env.PORT || 8080;
app.listen(port, host, () => {
  logger.info(`Listening on ${host}:${port}`);
});
