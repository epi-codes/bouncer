const debug = require('debug')('bouncer:web');

const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');
const passport = require('passport');

let router = Router();

router.get('/:key',
  asyncHandler(async function (req, res, next) {
    debug('flow');

    let data = await req.app.locals.adapter.getFlow(req.params.key);

    if (!data)
      return next(createError(400, 'This link has expired. Please try again.'));

    req.session.flow_key = req.params.key;

    passport.authenticate('azuread-openidconnect', {
      session: false,
      domain_hint: req.app.locals.config.azuread.tenantDomain
    })(req, res, next);
  })
);

module.exports = router;
