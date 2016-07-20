'use strict';

describe('Component: SymbolsGridComponent', function () {

  // load the controller's module
  beforeEach(module('marketWatcherApp'));

  var SymbolsGridComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    SymbolsGridComponent = $componentController('symbolsGrid', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
