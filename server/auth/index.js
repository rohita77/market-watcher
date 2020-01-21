'use strict';

const express = require('express');
const passport = require('passport');
const config = require('../config/environment');
const User = require('../api/user/user.model');

// Passport Configuration
require('./local/passport')(User, config);

var router = express.Router();

router.use('/local', require('./local'));

module.exports = router;
