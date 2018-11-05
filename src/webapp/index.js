const debug = require('debug')('bouncer:web');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

let indexRouter = require('./routes/index');
let flowRouter = require('./routes/flow');
let callbackRouter = require('./routes/callback');

let authentication = require('./authentication');

module.exports = function (config) {

  let app = express();
  app.locals.config = config;

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  app.use(helmet());
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  authentication(app);

  app.use('/', indexRouter);
  app.use('/', flowRouter);
  app.use('/callback', callbackRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    debug('not found');

    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    debug('error:', err.message);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
}