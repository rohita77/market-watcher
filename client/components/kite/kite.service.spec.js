'use strict';

describe('Service: kite', function() {
  // load the service's module
  beforeEach(module('marketWatcherApp.kite'));

  // instantiate service
  var kite;
  beforeEach(inject(function(_kite_) {
    kite = _kite_;
  }));

  it('should do something', function() {
    expect(!!kite).to.be.true;
  });
});
