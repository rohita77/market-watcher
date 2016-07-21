'use strict';

describe('Filter: moveSize', function () {

  // load the filter's module
  beforeEach(module('marketWatcherApp'));

  // initialize a new instance of the filter before each test
  var moveSize;
  beforeEach(inject(function ($filter) {
    moveSize = $filter('moveSize');
  }));

  it('should return the input prefixed with "moveSize filter:"', function () {
    var text = 'angularjs';
    expect(moveSize(text)).to.equal('moveSize filter: ' + text);
  });

});
