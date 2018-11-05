const debug = require('debug')('bouncer:web');

const { Router } = require('express');

let router = Router();

router.get('/', function(req, res, next) {
  debug('index');
  res.render('index');
});

module.exports = router;
