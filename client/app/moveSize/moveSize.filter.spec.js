'use strict';

describe('Filter: moveSize', function () {

  // load the filter's module
  beforeEach(module('marketWatcherApp'));

  // initialize a new instance of the filter before each test
  var moveSize;
  var thresholds;
  beforeEach(inject(function ($filter) {
    moveSize = $filter('moveSize');
    thresholds = [1, 2, 3];
  }));

  it('should return the direction "u" if input is positive and "d" if input is negative ', function () {
    var input = 0.5;
    expect(moveSize(input, thresholds, 'Positive')).to.equal('u-x');

    input = -0.5
    expect(moveSize(input, thresholds, 'Negative')).to.equal('d-x');

  });

  it('should return the size corresponding to the largest threshold when the input is greater all threshold values', function () {
    var input = 4;
    expect(moveSize(input, thresholds)).to.equal('u-xxx');

    input = -4;
    expect(moveSize(input, thresholds)).to.equal('d-xxx');

  });


  it('should return size(number of x) based on the threshold that the input falls in', function () {
    var test = [
      { input: 0.75, expectedSize: 'u-x', scenario: '< Threshold 1' },
      { input: 1, expectedSize: 'u-x', scenario: '= Threshold 1' },
      { input: 1.5, expectedSize: 'u-xx', scenario: 'Between Threshold 1 and 2' },
      { input: 2, expectedSize: 'u-xx', scenario: '= Threshold 2' },
      { input: 2.5, expectedSize: 'u-xxx', scenario: 'Between Threshold 1 and 2' },
      { input: 3, expectedSize: 'u-xxx', scenario: '= Threshold 3' },
      { input: 3.5, expectedSize: 'u-xxx', scenario: '> Threshold 3' }
    ]
    for (var i = 0; i < test.length; i++) {
      expect(moveSize(test[i].input, thresholds), test[i].scenario).to.equal(test[i].expectedSize);
    }

  });

  it('should return the correct size even if the threshold array is not ordered', function () {
    var input = 1.5;
    thresholds = [2, 1, 3];
    expect(moveSize(input, thresholds)).to.equal('u-xx');

    input = -1.5;
    expect(moveSize(input, thresholds)).to.equal('d-xx');

  });

  it('should return an error when a threshold is not a number', function () {

    var input = 1.5;
    thresholds = [2, 'a', 3];
    var err = new Error('Threshold should be an array of numeric values');
    expect(moveSize.bind(this,input, thresholds)).to.throw(Error,'Threshold should be an array of numeric values');

  });

  it('should return an error when input is non numeric', function () {

    var input = 'a';
    var err = new Error('Input should be a numeric value');
    expect(moveSize.bind(this,input, thresholds)).to.throw(Error,'Input should be a numeric value');

  });


});