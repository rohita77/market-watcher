/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

import * as auth from './auth/auth.service';


export default function(app) {
  // Insert routes below
  app.use('/api/daily-stats', require('./api/daily-stat'));
  app.use('/api/option-chains', require('./api/option-chain'));
  app.use('/api/symbols', require('./api/symbol'));
  app.use('/api/board-meetings', require('./api/board-meeting'));
  app.use('/api/quotes', require('./api/quote'));
  app.use('/api/watchlists', require('./api/watchlist'));
  //app.use('/api/quotes',auth.isAuthenticated(), require('./api/quote'));
  //app.use('/api/watchlists',auth.isAuthenticated(), require('./api/watchlist'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
