require('dotenv').config();
const log = console.log;
const express = require('express');
const app = express();
const server = app.listen(process.env.PORT, () =>
  log(`Server started on PORT ${process.env.PORT}`)
);
