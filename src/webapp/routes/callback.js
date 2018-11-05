const debug = require('debug')('bouncer:web');

const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');
const passport = require('passport');

let router = Router();

router.post('/',
  function (req, res, next) {
    debug('callback');
    next();
  },
  passport.authenticate('azuread-openidconnect', {
    session: false
  }),
  function(req, res, next) {
    res.render('success');
  }
);

module.exports = router;
