const debug = require('debug')('bouncer:web');

const passport = require('passport');
const { OIDCStrategy } = require('passport-azure-ad');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

module.exports = function (app) {
  debug('setting up passport');

  passport.use(new OIDCStrategy(
      {
      identityMetadata: `https://login.microsoftonline.com/${app.locals.config.azuread.tenantID}/.well-known/openid-configuration`,
      clientID: app.locals.config.azuread.clientID,
      responseType: 'id_token',
      responseMode: 'form_post',
      redirectUrl: `${app.locals.config.webapp.entrypoint}/callback`,
      allowHttpForRedirectUrl: true,
      passReqToCallback: false
    },
    function (iss, sub, profile, done) {
      if (!profile.oid || !profile.upn) {
        debug('invalid azuread account');
        return done(null, false, 'Invalid account.');
      }

      debug('valid azuread account');
      done(null, profile.upn);
    }
  ));

  app.use(session({
    name: 'bouncer.sid',
    store: new RedisStore({
      url: app.locals.config.redis.url,
      prefix: `${app.locals.config.redis.prefix}session:`
    }),
    secret: app.locals.config.secret,
    resave: false,
    saveUninitialized: false
  }));
}