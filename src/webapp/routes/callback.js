const debug = require('debug')('bouncer:web');

const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');
const passport = require('passport');

let router = Router();

router.post('/',
  asyncHandler(async function (req, res, next) {
    debug('callback');

    let data = await req.app.locals.adapter.getFlow(req.session.flow_key);

    if (!data)
      return next(createError(400, 'This link has expired. Please try again.'));

    next();
  }),
  passport.authenticate('azuread-openidconnect', {
    session: false
  }),
  asyncHandler(async function(req, res, next) {
    await req.app.locals.adapter.completeFlow(req.session.flow_key);

    res.render('success');
  })
);

module.exports = router;
