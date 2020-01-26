/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
const Thing = require('../api/thing/thing.model');
const User = require('../api/user/user.model');
const Watchlist = require('../api/watchlist/watchlist.model');


Thing.find({}).deleteMany()
  .then(() => {
    Thing.create({
      name: 'Development Tools',
      info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
        'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
        'Stylus, Sass, and Less.'
    }, {
      name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
        'AngularJS, and Node.'
    }, {
      name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep ' +
        'tests alongside code. Automatic injection of scripts and ' +
        'styles into your index.html'
    }, {
      name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more ' +
        'code reusability and maximum scalability'
    }, {
      name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript ' +
        'payload, minifies your scripts/css/images, and rewrites asset ' +
        'names for caching.'
    }, {
      name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
        'and openshift subgenerators'
    });
  });

User.find({}).deleteMany()
  .then(() => {
    User.create({
        provider: 'local',
        name: 'Test User',
        email: 'test@example.com',
        password: 'test'
      }, {
        provider: 'local',
        role: 'admin',
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin'
      })
      .then(() => {
        console.log('finished populating users');
      });
  });

// Watchlist.find({}).deleteMany()
//   .then(() => {
//     Watchlist.create({
//         "_id": "NIFTY50",
//         "name": "NIFTY 50 Index",
//         "description": "Nifty 50 Index",
//         "downloadKey": "nifty50list",
//         "subType": "NSE.IN",
//       }, {
//         "_id": "NIFTY100",
//         "name": "NIFTY 100 Index",
//         "description": "Nifty 100 Index",
//         "downloadKey": "nifty100list",
//         "subType": "NSE.IN",
//       }, {
//         "_id": "NIFTY200",
//         "name": "NIFTY 200 Index",
//         "description": "Nifty 200 Index",
//         "downloadKey": "nifty200list",
//       }, {
//         "_id": "NIFTYMidcapLiq15",
//         "name": "NIFTY Midcap Liquid 15",
//         "description": "NIFTY Midcap Liquid 15",
//         "downloadKey": "Nifty_Midcap_Liquid15",
//         "subType": "NSE.IN",
//       })
//       .then(() => {
//         console.log('finished populating watchlists');
//       });

//   });
