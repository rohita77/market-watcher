'use strict'

import moment from 'moment';

// var nseTools = require('../../../components/nse-data-adapter/index');
var NSEDataAdapter = require('./index');

const nseCloseTime = "15:30:00";
const ISTUTCOffset =  "GMT+0530";

let getISTDate = (dt) => new Date(`${dt} ${nseCloseTime} ${ISTUTCOffset}`);

describe('Trading Holiday', function () {

  it('Should return true when date is a Trading Holiday', function () {
    expect(NSEDataAdapter.isTradingHoliday(getISTDate("29-Mar-2018"))).to.be.true;
  });

  it('Should return false when date is non Trading Holiday', function () {
    expect(NSEDataAdapter.isTradingHoliday(getISTDate("28-Mar-2018"))).to.be.false;
  });

  it('Should return true when moment is a Trading Holiday', function () {
    expect(NSEDataAdapter.isTradingHoliday(moment(getISTDate("29-Mar-2018")))).to.be.true;
  });

});

describe('Get Next Trading Date', function () {

  it('Should return same date if time is before 3:30 pm', function () {
    let calendarDate = new Date("27-Feb-2018 14:00:00 GMT+0530");
    let currentTradingDate = new Date("27-Feb-2018 15:30:00 GMT+0530");
    expect(NSEDataAdapter.getNextTradingDate(calendarDate)).to.deep.equal(currentTradingDate);
  });

  it('Should return next trading date if time is after 3:30 pm', function () {
    let calendarDate = new Date("27-Feb-2018 16:00:00 GMT+0530");
    let nextTradingDate = new Date("28-Feb-2018 15:30:00 GMT+0530");
    expect(NSEDataAdapter.getNextTradingDate(calendarDate)).to.deep.equal(nextTradingDate);
  });

});

describe('Calculate Monthly Expiry', function () {
  describe('Front Month Expiry Date', function() {
    it('Should return last Thursday of the current month when trading date is before last Thursday of the current month', function () {
      let frontMonthExpiryDate = getISTDate("22-Feb-2018");
      let tradingDate = getISTDate("21-Feb-2018");
      expect(NSEDataAdapter.getFrontMonthExpiryDate(tradingDate)).to.deep.equal(frontMonthExpiryDate);
    });

    it('Should return days to last Thursday of the current month when trading date is before last Thursday of the current month', function () {
      let tradingDate = getISTDate("21-Feb-2018");
      expect(NSEDataAdapter.getDaysToFrontMonthExpiry(tradingDate)).to.equal(1);

    });


    it('Should return last Thursday of the next month when trading date is after the last Thursday of current month', function () {
      let frontMonthExpiryDate = getISTDate("22-Feb-2018");
      let tradingDate = getISTDate("29-Jan-2018");
      expect(NSEDataAdapter.getFrontMonthExpiryDate(tradingDate)).to.deep.equal(frontMonthExpiryDate);
      expect(NSEDataAdapter.getFrontMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("22Feb2018");
    });

    it('Should return days to last Thursday of the next month when trading date is after the last Thursday of current month', function () {
      let tradingDate = getISTDate("29-Jan-2018");
      expect(NSEDataAdapter.getDaysToFrontMonthExpiry(tradingDate)).to.equal(24);

    });

    it('Should return previous trading day if last Thursday of the month is a trading holiday', function () {
      let frontMonthExpiryDate = getISTDate("28-Mar-2018");
      let tradingDate = getISTDate("01-Mar-2018");
      expect(NSEDataAdapter.getFrontMonthExpiryDate(tradingDate)).to.deep.equal(frontMonthExpiryDate);
      expect(NSEDataAdapter.getFrontMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("28Mar2018");

      tradingDate = getISTDate("26-Feb-2018");
      expect(NSEDataAdapter.getFrontMonthExpiryDate(tradingDate)).to.deep.equal(frontMonthExpiryDate);
      expect(NSEDataAdapter.getFrontMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("28Mar2018");

    });

});

  describe("Back Month Expiry Date", function() {
    it('Should return last Thursday of the next month when trading date is before last Thursday of the current month', function () {
      let backMonthExpiryDate = getISTDate("22-Feb-2018");
      let tradingDate = getISTDate("22-Jan-2018");
      expect(NSEDataAdapter.getBackMonthExpiryDate(tradingDate)).to.deep.equal(backMonthExpiryDate);
      expect(NSEDataAdapter.getBackMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("22Feb2018");
    });

    it('Should return last Thursday of the subsequent month when trading date is after the last Thursday of current month', function () {
      let backMonthExpiryDate = getISTDate("22-Feb-2018");
      let tradingDate = getISTDate("29-Dec-2017");
      expect(NSEDataAdapter.getBackMonthExpiryDate(tradingDate)).to.deep.equal(backMonthExpiryDate);
      expect(NSEDataAdapter.getBackMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("22Feb2018");
    });

    it('Should return previous trading day if last Thursday of the back month is a trading holiday', function () {
      let backMonthExpiryDate = getISTDate("28-Mar-2018");
      let tradingDate = getISTDate("29-Jan-2018");
      expect(NSEDataAdapter.getBackMonthExpiryDate(tradingDate)).to.deep.equal(backMonthExpiryDate);
      expect(NSEDataAdapter.getBackMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("28Mar2018");

      tradingDate = getISTDate("02-Feb-2018");
      expect(NSEDataAdapter.getBackMonthExpiryDate(tradingDate)).to.deep.equal(backMonthExpiryDate);
      expect(NSEDataAdapter.getBackMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("28Mar2018");
    });
  });

  describe("Last Month Expiry Date", function() {
    it('Should return last Thursday of the previous month when trading date is before last Thursday of the current month', function () {
      let lastMonthExpiryDate = getISTDate("22-Feb-2018");
      let tradingDate = getISTDate("21-Mar-2018");
      expect(NSEDataAdapter.getPreviousMonthExpiryDate(tradingDate)).to.deep.equal(lastMonthExpiryDate);
      expect(NSEDataAdapter.getPreviousMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("22Feb2018");
    });

    it('Should return last Thursday of the current month when trading date is after the last Thursday of current month', function () {
      let lastMonthExpiryDate = getISTDate("22-Feb-2018");
      let tradingDate = getISTDate("26-Feb-2018");
      expect(NSEDataAdapter.getPreviousMonthExpiryDate(tradingDate)).to.deep.equal(lastMonthExpiryDate);
      expect(NSEDataAdapter.getPreviousMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("22Feb2018");
    });

    it('Should return previous trading day if last Thursday of the previous month is a trading holiday', function () {
      let lastMonthExpiryDate = getISTDate("28-Mar-2018");
      let tradingDate = getISTDate("29-Mar-2018");
      expect(NSEDataAdapter.getPreviousMonthExpiryDate(tradingDate)).to.deep.equal(lastMonthExpiryDate);
      expect(NSEDataAdapter.getPreviousMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("28Mar2018");

      tradingDate = getISTDate("04-Apr-2018");
      expect(NSEDataAdapter.getPreviousMonthExpiryDate(tradingDate)).to.deep.equal(lastMonthExpiryDate);
      expect(NSEDataAdapter.getPreviousMonthExpiryDate(tradingDate,"DDMMMYYYY")).to.deep.equal("28Mar2018");
    });
  });

});







describe('Market Timing and Status', function () {
  describe('Indicate if market is open', function () {

  });

  describe('Get minutes from open', function () {

  });


});