'use strict';

describe('Component: optionChain', function() {
  // load the component's module
  beforeEach(module('marketWatcherApp.option-chain'));

  var optionChainComponent;

  // Initialize the component and a mock scope
  beforeEach(inject(function($componentController) {
    optionChainComponent = $componentController('optionChain', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
