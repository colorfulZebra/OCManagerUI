//app.js
"use strict";
import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import path from 'path';
import favicon from 'serve-favicon';
import proxy from 'http-proxy-middleware';
import cors from 'cors';
import morgan from 'morgan';

let app = express();
app.use(morgan('short'));
app.use(cors({
  credentials: true,
  origin: 'http://localhost:8080'
}));
let env = config.env || 'dev';

if (env === 'dev') {
  //app.use(require('connect-livereload')());
  app.use("/fonts", express.static("app/bower_components/bootstrap/fonts"));
}
//app.use('/ocmanager', proxy({target: 'http://10.1.236.95:8080', changeOrigin: true}));

  console.log('ADAPTER_API_SERVER', process.env.ADAPTER_API_SERVER);
  console.log('SVCAMOUNT_API_SERVER', process.env.SVCAMOUNT_API_SERVER);

app.use('/ocmanager', proxy({target: process.env.ADAPTER_API_SERVER, changeOrigin: true}));
//app.use('/ocmanager', proxy({target: 'http://10.1.236.113:9090', changeOrigin: true}));
//app.use('/oapi/', proxy({target: 'https://10.1.130.134:8443', changeOrigin: true, secure: false}));
app.use('/sapi/', proxy({target: process.env.SVCAMOUNT_API_SERVER, changeOrigin: true}));

app.use(express.static(config[env].dist));
app.use(favicon(path.join(__dirname, '../', config[env].dist, '/favicon.ico')));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '../', config[env].dist, '/404.html'));// load the single view file (angular will handle the page changes on the front-end)
});

app.listen(config[env].port, function () {
  console.log('App listening on port ' + config[env].port + "!");
});

module.exports = app;
