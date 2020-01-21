const app = require('./');
const mongoose = require('mongoose');

after(function(done) {
  app.angularFullstack.on('close', () => done());
  mongoose.connection.close();
  app.angularFullstack.close();
});
