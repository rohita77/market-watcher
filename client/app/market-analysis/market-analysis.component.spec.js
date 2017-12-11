'use strict';

describe('Component: MarketAnalysisComponent', function() {
  // load the controller's module
  beforeEach(module('marketWatcherApp.market-analysis'));

  var MarketAnalysisComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    MarketAnalysisComponent = $componentController('market-analysis', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
