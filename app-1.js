"use strict";
angular.module("marketWatcherApp", ["marketWatcherApp.auth", "marketWatcherApp.admin", "marketWatcherApp.constants", "ngCookies", "ngResource", "ngSanitize", "btford.socket-io", "ui.router", "ui.bootstrap", "validation.match", "marketWatcherApp.option-chain", "marketWatcherApp.chart", "marketWatcherApp.market-analysis"]).config(["$urlRouterProvider", "$locationProvider", function (t, e) {
  t.otherwise("/"), e.html5Mode(!0)
}]), angular.module("marketWatcherApp.admin", ["marketWatcherApp.auth", "ui.router"]), angular.module("marketWatcherApp.auth", ["marketWatcherApp.constants", "marketWatcherApp.util", "ngCookies", "ui.router"]).config(["$httpProvider", function (t) {
  t.interceptors.push("authInterceptor")
}]), angular.module("marketWatcherApp.util", []), angular.module("marketWatcherApp").config(["$stateProvider", function (t) {
  t.state("login", {
    url: "/login",
    templateUrl: "app/account/login/login.html",
    controller: "LoginController",
    controllerAs: "vm"
  }).state("logout", {
    url: "/logout?referrer",
    referrer: "main",
    template: "",
    controller: ["$state", "Auth", function (t, e) {
      var r = t.params.referrer || t.current.referrer || "main";
      e.logout(), t.go(r)
    }]
  }).state("signup", {
    url: "/signup",
    templateUrl: "app/account/signup/signup.html",
    controller: "SignupController",
    controllerAs: "vm"
  }).state("settings", {
    url: "/settings",
    templateUrl: "app/account/settings/settings.html",
    controller: "SettingsController",
    controllerAs: "vm",
    authenticate: !0
  })
}]).run(["$rootScope", function (t) {
  t.$on("$stateChangeStart", (function (t, e, r, o) {
    "logout" === e.name && o && o.name && !o.authenticate && (e.referrer = o.name)
  }))
}]);
class LoginController {
  constructor(t, e) {
    this.user = {}, this.errors = {}, this.submitted = !1, this.Auth = t, this.$state = e
  }
  login(t) {
    this.submitted = !0, t.$valid && this.Auth.login({
      email: this.user.email,
      password: this.user.password
    }).then(() => {
      this.$state.go("main")
    }).catch(t => {
      this.errors.other = t.message
    })
  }
}
LoginController.$inject = ["Auth", "$state"], angular.module("marketWatcherApp").controller("LoginController", LoginController);
class SettingsController {
  constructor(t) {
    this.Auth = t
  }
  changePassword(t) {
    this.submitted = !0, t.$valid && this.Auth.changePassword(this.user.oldPassword, this.user.newPassword).then(() => {
      this.message = "Password successfully changed."
    }).catch(() => {
      t.password.$setValidity("mongoose", !1), this.errors.other = "Incorrect password", this.message = ""
    })
  }
}
SettingsController.$inject = ["Auth"], angular.module("marketWatcherApp").controller("SettingsController", SettingsController);
class SignupController {
  constructor(t, e) {
    this.Auth = t, this.$state = e
  }
  register(t) {
    this.submitted = !0, t.$valid && this.Auth.createUser({
      name: this.user.name,
      email: this.user.email,
      password: this.user.password
    }).then(() => {
      this.$state.go("main")
    }).catch(e => {
      e = e.data, this.errors = {}, angular.forEach(e.errors, (e, r) => {
        t[r].$setValidity("mongoose", !1), this.errors[r] = e.message
      })
    })
  }
}

function moveSizeFilter() {
  return function (t = 0, e) {
    if (isNaN(+t)) throw new Error("Input should be a numeric value");
    if (!e.every(t => !isNaN(t))) throw new Error("Threshold should be an array of numeric values");
    let r = Number(t),
      o = (r >= 0 ? "u" : "d") + "-",
      s = 0,
      n = e.sort((t, e) => t - e);
    for (r = Math.abs(r), s = 0; s < n.length; s++) {
      if (r <= n[s]) return o + "x";
      o += "x"
    }
    return o
  }
}
SignupController.$inject = ["Auth", "$state"], angular.module("marketWatcherApp").controller("SignupController", SignupController),
  function () {
    class t {
      constructor(t) {
        this.users = t.query()
      }
      delete(t) {
        t.$remove(), this.users.splice(this.users.indexOf(t), 1)
      }
    }
    t.$inject = ["User"], angular.module("marketWatcherApp.admin").controller("AdminController", t)
  }(), angular.module("marketWatcherApp.admin").config(["$stateProvider", function (t) {
    t.state("admin", {
      url: "/admin",
      templateUrl: "app/admin/admin.html",
      controller: "AdminController",
      controllerAs: "admin",
      authenticate: "admin"
    })
  }]),
  function (t, e) {
    t.module("marketWatcherApp.constants", []).constant("appConfig", {
      userRoles: ["guest", "user", "admin"]
    })
  }(angular),
  function () {
    class t {
      constructor(t, e, r, o, s, n) {
        this.$location = n, this.$anchorScroll = s, this.ltp = this.symbol.quote.ltP, this.expH = this.symbol.quote.expectedHigh, this.expL = this.symbol.quote.expectedLow, this.sdH = this.symbol.quote.expectedHigh + (this.ltp - this.expL), this.sdL = this.symbol.quote.expectedLow - (this.expH - this.ltp), r(`api/option-chains/${this.symbol.symbol}`).get().$promise.then(t => {
          this.oc = t.data[0];
          let e = n.hash(`anchor${this.symbol.quote.expectedLowOptions.strikePrice.toString()}`);
          this.$anchorScroll(e)
        })
      }
      $onInit() {}
      getMoneyClass(t, e = !1) {
        let r;
        return r = e ? t <= this.ltp ? " active" : t >= this.sdH ? " success" : t >= this.expH ? " warning" : t >= this.ltp ? " danger" : " default" : t >= this.ltp ? " active" : t <= this.sdL ? " success" : t <= this.expL ? " warning" : t <= this.ltp ? " danger" : " default", r
      }
    }
    t.$inject = ["$log", "$interval", "$resource", "$sce", "$anchorScroll", "$location"], t.$inject = ["$log", "$interval", "$resource", "$sce", "$anchorScroll", "$location"], angular.module("marketWatcherApp.events", ["ui.router"]).component("events", {
      templateUrl: "app/events/events.html",
      controller: t,
      controllerAs: "eventsCtrl",
      bindings: {
        symbol: "<symbol"
      }
    }).name
  }(), angular.module("marketWatcherApp.events").config(["$stateProvider", function (t) {
    t.state("events", {
      url: "/events",
      views: {
        "": {
          template: "<events></events>"
        }
      }
    })
  }]),
  function () {
    class t {
      constructor(t, e, r) {
        this.$http = t, this.socket = r, this.awesomeThings = [], e.$on("$destroy", (function () {
          r.unsyncUpdates("thing")
        })), e.quotes = [], e.quotes.push({
          symbol: "VIX",
          last: 15.1,
          perChangeSize: "1u",
          perChange: 2.2
        }), e.quotes.push({
          symbol: "NIFTY 50",
          last: 8325,
          perChangeSize: "1u",
          perChange: 1.2
        }), e.quotes.push({
          symbol: "INFY",
          last: 1050,
          perChangeSize: "3d",
          perChange: -10.3
        }), e.quotes.push({
          symbol: "AXISBANK",
          last: 592.75,
          perChangeSize: "1u",
          perChange: 1.6
        }), e.quotes.push({
          symbol: "TCS",
          last: 2653.55,
          perChangeSize: "3u",
          perChange: -12.4
        }), e.quotes.push({
          symbol: "COALINDIA",
          last: 346.2,
          perChangeSize: "2u",
          perChange: 2.5
        }), e.quotes.push({
          symbol: "ACC",
          last: 1644.75,
          perChangeSize: "1d",
          perChange: -1.2
        }), e.quotes.push({
          symbol: "BHEL",
          last: 135,
          perChangeSize: "2d",
          perChange: -4.2
        }), e.quotes.push({
          symbol: "LT",
          last: 1494.1,
          perChangeSize: "1d",
          perChange: -.8
        }), e.getQuote = t => e.quotes.find(e => e.symbol.match(new RegExp("^" + t + "$")))
      }
      $onInit() {
        this.$http.get("/api/things").then(t => {
          this.awesomeThings = t.data, this.socket.syncUpdates("thing", this.awesomeThings)
        })
      }
      addThing() {
        this.newThing && (this.$http.post("/api/things", {
          name: this.newThing
        }), this.newThing = "")
      }
      deleteThing(t) {
        this.$http.delete("/api/things/" + t._id)
      }
    }
    t.$inject = ["$http", "$scope", "socket"], angular.module("marketWatcherApp").component("main", {
      templateUrl: "app/main/main.html",
      controller: t
    })
  }(), angular.module("marketWatcherApp").config(["$stateProvider", function (t) {
    t.state("main", {
      url: "/",
      template: "<main></main>"
    })
  }]),
  function () {
    class t {
      constructor(t, e) {
        this.$resource = e, this.$resource("/api/daily-stats").get().$promise.then(t => {
          this.dailyStat = t.data
        })
      }
    }
    t.$inject = ["$log", "$resource"], t.$inject = ["$log", "$resource"], angular.module("marketWatcherApp.market-analysis", ["ui.router"]).component("marketAnalysis", {
      templateUrl: "app/market-analysis/market-analysis.html",
      controller: t,
      controllerAs: "marketAnalysisCtrl"
    }).name
  }(), angular.module("marketWatcherApp.market-analysis").config(["$stateProvider", function (t) {
    t.state("market-analysis", {
      url: "/market-analysis",
      views: {
        "": {
          template: "<market-analysis></market-analysis>"
        }
      }
    })
  }]), angular.module("marketWatcherApp").filter("moveSize", moveSizeFilter),
  function () {
    class t {
      constructor(t, e, r, o, s, n, a) {
        this.$resource = r, this.$interval = e, this.$log = t, this.$location = n, this.$anchorScroll = s, this.Modal = a, this.filterIsCollapsed = !0, this.sortBy = "symbol", this.sortReverse = !1, this.incEarnings = !1, this.selectedWatchlist = {
          _id: "NIFTY100",
          name: "NIFTY 100 Index"
        }, this.query = {
          watchlists: "NIFTY100"
        }, this.$resource("/api/watchlists").get().$promise.then(t => {
          this.watchlistChoices = t.data
        }), this.$resource("/api/symbols").get().$promise.then(t => {
          this.watchlist = {
            name: "NIFTY100",
            symbols: t.data
          }, this.$log.info(`Retrieved watchlist ${this.watchlist.name} with ${this.watchlist.symbols.length} symbols`), this.watchlist.symbols = this.watchlist.symbols.map(t => (t.key = [t.symbol, t.name, `(${t.industry})`], t)), this.refreshQuoteData(!0);
          this.$interval(this.refreshQuoteData.bind(this, !1), 3e5)
        }).catch((t, e, r, o) => {
          this.$log.warn(t, e, r, o)
        }), this.getSortOrder = t => {
          if (this.sortBy.match("^quote.")) {
            let e = this.sortBy.split(".").reduce((t, e) => t[e], t);
            return -1 * Math.abs(e)
          }
          return t[this.sortBy]
        }
      }
      filterIndustry(t) {
        this.query.key = this.query.key === `(${t.industry})` ? "" : `(${t.industry})`
      }
      changeWatchlist(t) {
        this.query.watchlists = t._id, this.selectedWatchlist = t
      }
      toggleSelectedSymbol(t) {
        this.selectedSymbol = t;
        let e = this.$location.hash(`anchor-${t}`);
        this.$anchorScroll(e), this.$anchorScroll.yOffset = 60
      }
      setSortBy(t) {
        this.sortReverse = this.sortBy === t && !this.sortReverse, this.sortBy = t
      }
      getReverse(t) {
        return this.sortBy === t && !this.sortReverse
      }
      $onInit() {
        this.filterIsCollapsed = !0
      }
      refreshQuoteData(t) {
        this.$resource("/api/quotes").get().$promise.then(e => {
          let r = e.data[0];
          this.quoteTime = r.quoteTime, this.refreshTime = r.refreshTime, t && (this.sortBy = "quote.maxROC", this.sortReverse = !1, this.$log.info(`First Call retrieved ${r.quotes.length} quotes`)), this.watchlist.symbols = this.watchlist.symbols.filter(t => {
            let e = new RegExp("^" + t.symbol + "$"),
              o = r.quotes.find(t => t.symbol.match(e));
            return t.quote = o || {}, t.quote.ntP > 40 || t.quote.trdVol > 5
          }), console.log(this.watchlist.symbols.length), console.log(this.watchlist.symbols)
        }).catch((t, e, r, o) => {
          this.$log.warn(t, e, r, o)
        })
      }
      openOC(t) {
        return this.Modal.confirm.ok((function (t) {}))(`Option Chain for ${t.symbol} (15 min delayed)`, t, '<option-chain symbol="data">')
      }
      openChart(t) {
        return this.Modal.confirm.ok((function (t) {}))(`Chart ( EOD / Delayed ) For ${t.symbol}`, t, '<chart symbol="data">')
      }
    }
    t.$inject = ["$log", "$interval", "$resource", "$sce", "$anchorScroll", "$location", "Modal"], angular.module("marketWatcherApp").component("symbolsGrid", {
      templateUrl: "app/symbolsGrid/symbolsGrid.html",
      controller: t,
      controllerAs: "symbolsGridCtrl"
    })
  }(), angular.module("marketWatcherApp").config(["$stateProvider", function (t) {
    t.state("symbolsGrid", {
      url: "/symbolsGrid",
      template: "<symbols-grid></symbols-grid>"
    })
  }]),
  function () {
    function t(t, e, r, o, s, n, a) {
      var i = n.safeCb,
        l = {},
        c = s.userRoles || [];
      r.get("token") && "/logout" !== t.path() && (l = a.get());
      var u = {
        login: ({
          email: t,
          password: s
        }, n) => e.post("/auth/local", {
          email: t,
          password: s
        }).then(t => (r.put("token", t.data.token), (l = a.get()).$promise)).then(t => (i(n)(null, t), t)).catch(t => (u.logout(), i(n)(t.data), o.reject(t.data))),
        logout() {
          r.remove("token"), l = {}
        },
        createUser: (t, e) => a.save(t, (function (o) {
          return r.put("token", o.token), l = a.get(), i(e)(null, t)
        }), (function (t) {
          return u.logout(), i(e)(t)
        })).$promise,
        changePassword: (t, e, r) => a.changePassword({
          id: l._id
        }, {
          oldPassword: t,
          newPassword: e
        }, (function () {
          return i(r)(null)
        }), (function (t) {
          return i(r)(t)
        })).$promise,
        getCurrentUser(t) {
          if (0 === arguments.length) return l;
          var e = l.hasOwnProperty("$promise") ? l.$promise : l;
          return o.when(e).then(e => (i(t)(e), e), () => (i(t)({}), {}))
        },
        isLoggedIn(t) {
          return 0 === arguments.length ? l.hasOwnProperty("role") : u.getCurrentUser(null).then(e => {
            var r = e.hasOwnProperty("role");
            return i(t)(r), r
          })
        },
        hasRole(t, e) {
          var r = function (t, e) {
            return c.indexOf(t) >= c.indexOf(e)
          };
          return arguments.length < 2 ? r(l.role, t) : u.getCurrentUser(null).then(o => {
            var s = !!o.hasOwnProperty("role") && r(o.role, t);
            return i(e)(s), s
          })
        },
        isAdmin() {
          return u.hasRole.apply(u, [].concat.apply(["admin"], arguments))
        },
        getToken: () => r.get("token")
      };
      return u
    }
    t.$inject = ["$location", "$http", "$cookies", "$q", "appConfig", "Util", "User"], angular.module("marketWatcherApp.auth").factory("Auth", t)
  }(),
  function () {
    function t(t, e, r, o, s) {
      var n;
      return {
        request: t => (t.headers = t.headers || {}, r.get("token") && s.isSameOrigin(t.url) && (t.headers.Authorization = "Bearer " + r.get("token")), t),
        responseError: t => (401 === t.status && ((n || (n = o.get("$state"))).go("login"), r.remove("token")), e.reject(t))
      }
    }
    t.$inject = ["$rootScope", "$q", "$cookies", "$injector", "Util"], angular.module("marketWatcherApp.auth").factory("authInterceptor", t)
  }(), angular.module("marketWatcherApp.auth").run(["$rootScope", "$state", "Auth", function (t, e, r) {
    t.$on("$stateChangeStart", (function (t, o) {
      o.authenticate && ("string" == typeof o.authenticate ? r.hasRole(o.authenticate, _.noop).then(o => {
        if (!o) return t.preventDefault(), r.isLoggedIn(_.noop).then(t => {
          e.go(t ? "main" : "login")
        })
      }) : r.isLoggedIn(_.noop).then(r => {
        r || (t.preventDefault(), e.go("main"))
      }))
    }))
  }]),
  function () {
    function t(t) {
      return t("/api/users/:id/:controller", {
        id: "@_id"
      }, {
        changePassword: {
          method: "PUT",
          params: {
            controller: "password"
          }
        },
        get: {
          method: "GET",
          params: {
            id: "me"
          }
        }
      })
    }
    t.$inject = ["$resource"], angular.module("marketWatcherApp.auth").factory("User", t)
  }(), angular.module("marketWatcherApp.chart", []).directive("chart", (function () {
    return {
      templateUrl: "components/chart/chart.html",
      transclude: !0,
      restrict: "EA",
      link: function (t, e, r) {
        new TradingView.widget({
          container_id: "chart",
          autosize: !0,
          symbol: `NSE:${t.data.symbol}`,
          interval: "D",
          timezone: "Asia/Kolkata",
          theme: "Dark",
          style: "1",
          locale: "en",
          enable_publishing: !1,
          hideideas: !0,
          hide_top_toolbar: !1,
          withdateranges: !0,
          show_popup_button: !0,
          fullscreen: !0,
          studies: ["MAExp@tv-basicstudies"],
          time_frames: [{
            text: "50y",
            resolution: "6M"
          }, {
            text: "3y",
            resolution: "W"
          }, {
            text: "8m",
            resolution: "D"
          }, {
            text: "3d",
            resolution: "5"
          }],
          studies_overrides: {
            "moving average exponential.length": 21,
            "moving average exponential.linewidth": 20
          },
          client_id: "tradingview.com",
          user_id: "rohita77"
        })
      }
    }
  })), angular.module("marketWatcherApp").directive("footer", (function () {
    return {
      templateUrl: "components/footer/footer.html",
      restrict: "E",
      link: function (t, e) {
        e.addClass("footer")
      }
    }
  })), angular.module("marketWatcherApp").factory("kite", (function () {
    return {}
  })), angular.module("marketWatcherApp").factory("Modal", ["$rootScope", "$uibModal", function (t, e) {
    function r(r = {}, o = "", s = "modal-default") {
      var n = t.$new();
      return angular.extend(n, r), e.open({
        template: `<modal>${o}`,
        windowClass: s,
        scope: n
      })
    }
    return {
      confirm: {
        delete: (t = angular.noop) => function () {
          var e, o = Array.prototype.slice.call(arguments),
            s = o.shift();
          (e = r({
            modal: {
              dismissable: !0,
              title: "Confirm Delete",
              html: "<p>Are you sure you want to delete <strong>" + s + "</strong> ?</p>",
              buttons: [{
                classes: "btn-danger",
                text: "Delete",
                click: function (t) {
                  e.close(t)
                }
              }, {
                classes: "btn-default",
                text: "Okay",
                click: function (t) {
                  e.dismiss(t)
                }
              }]
            }
          }, "modal-danger")).result.then((function (e) {
            t.apply(e, o)
          }))
        },
        ok: (t = angular.noop) => function () {
          var e, o = Array.prototype.slice.call(arguments),
            s = o.shift(),
            n = o.shift(),
            a = o.shift();
          (e = r({
            modal: {
              dismissable: !0,
              title: s,
              html: "<p>Are you sure you want to ok <strong>" + s + "</strong> ?</p>",
              buttons: [{
                classes: "btn-default",
                text: "Okay",
                click: function (t) {
                  e.dismiss(t)
                }
              }]
            },
            data: n
          }, a, "modal-danger")).result.then((function (e) {
            t.apply(e, o)
          }))
        }
      }
    }
  }]), angular.module("marketWatcherApp").directive("modal", () => ({
    restrict: "E",
    transclude: !0,
    templateUrl: "components/modal/modal.html"
  })), angular.module("marketWatcherApp").directive("mongooseError", (function () {
    return {
      restrict: "A",
      require: "ngModel",
      link: function (t, e, r, o) {
        e.on("keydown", () => o.$setValidity("mongoose", !0))
      }
    }
  }));
class NavbarController {
  constructor(t, e, r) {
    this.isLoggedIn = t.isLoggedIn, this.isAdmin = t.isAdmin, this.getCurrentUser = t.getCurrentUser, this.menu = [{
      state: "symbolsGrid",
      title: "Grid"
    }, {
      state: "market-analysis",
      title: "Analysis"
    }], this.isCollapsed = !0, e.navClose = () => {
      this.isCollapsed = !0
    }, e.quotes = [], e.quotes.push({
      symbol: "VIX",
      last: 15.1,
      perChangeSize: "1u",
      perChange: 2.2
    }), e.quotes.push({
      symbol: "NIFTY 50",
      last: 8325,
      perChangeSize: "1u",
      perChange: 1.2
    }), e.quotes.push({
      symbol: "INFY",
      last: 1050,
      perChangeSize: "3d",
      perChange: -10.3
    }), e.getQuote = t => e.quotes.find(e => e.symbol.match(new RegExp("^" + t + "$"))), KiteConnect.ready(() => {
      r.connect = new KiteConnect("34dvxrlj3l08i9tv"), r.connect.link("#custom-button")
    })
  }
}

function addOption(t, e, r, o) {
  let s = r.oc,
    n = r.symbol.frontMonthLotSize,
    a = t["C" === e ? "call" : "put"].ask,
    i = `${s.symbol}${s.expDt.slice(7,9)}${s.expDt.slice(2,5)}${t.price}${"C"===e?"CE":"PE"}`;
  o.connect.add({
    exchange: "NFO",
    tradingsymbol: i,
    quantity: n,
    transaction_type: "SELL",
    order_type: "LIMIT",
    price: a
  }), alert(`Added ${n} of ${i} at ${a}`)
}

function getMoneynessClass(t, e = !1, r) {
  let o;
  return o = e ? t <= r.ltp ? " active" : t >= r.sdH ? " success" : t >= r.expH ? " warning" : t >= r.ltp ? " danger" : " default" : t >= r.ltp ? " active" : t <= r.sdL ? " success" : t <= r.expL ? " warning" : t <= r.ltp ? " danger" : " default", o
}
NavbarController.$inject = ["Auth", "$scope", "kite"], angular.module("marketWatcherApp").controller("NavbarController", NavbarController), angular.module("marketWatcherApp").directive("navbar", () => ({
    transclude: !0,
    templateUrl: "components/navbar/navbar.html",
    restrict: "E",
    controller: "NavbarController",
    controllerAs: "nav"
  })), angular.module("marketWatcherApp.option-chain", []).directive("optionChain", ["$log", "$interval", "$resource", "$sce", "$anchorScroll", "$location", "kite", function (t, e, r, o, s, n, a) {
    return {
      templateUrl: "components/option-chain/option-chain.html",
      scope: {
        symbol: "="
      },
      link: function (t, e, o) {
        t.$location = n, t.$anchorScroll = s, t.kite = a, t.ltp = t.symbol.quote.ltP, t.expH = t.symbol.quote.expectedHigh, t.expL = t.symbol.quote.expectedLow, t.sdH = t.symbol.quote.expectedHigh + (t.ltp - t.expL), t.sdL = t.symbol.quote.expectedLow - (t.expH - t.ltp), t.sdH2 = t.sdH + 1 * (t.sdH - t.ltp), t.sdL2 = t.sdL - 1 * (t.ltp - t.sdL);
        let i = r(`api/option-chains/${t.symbol.symbol}`);
        t.addCallOption = e => addOption(e, "C", t, a), t.addPutOption = e => addOption(e, "P", t, a), t.getMoneynessClass = (e, r = !1) => getMoneynessClass(e, r, t), i.get().$promise.then(e => {
          t.oc = e.data[0];
          let r = n.hash(`anchor${t.symbol.quote.expectedLowOptions.price.toString()}`);
          t.$anchorScroll(r)
        })
      }
    }
  }]), angular.module("marketWatcherApp").factory("socket", ["socketFactory", function (t) {
    var e = t({
      ioSocket: io("", {
        path: "/socket.io-client"
      })
    });
    return {
      socket: e,
      syncUpdates(t, r, o) {
        o = o || angular.noop, e.on(t + ":save", (function (t) {
          var e = _.find(r, {
              _id: t._id
            }),
            s = r.indexOf(e),
            n = "created";
          e ? (r.splice(s, 1, t), n = "updated") : r.push(t), o(n, t, r)
        })), e.on(t + ":remove", (function (t) {
          _.remove(r, {
            _id: t._id
          }), o("deleted", t, r)
        }))
      },
      unsyncUpdates(t) {
        e.removeAllListeners(t + ":save"), e.removeAllListeners(t + ":remove")
      }
    }
  }]),
  function () {
    function t(t) {
      var e = {
        safeCb: t => angular.isFunction(t) ? t : angular.noop,
        urlParse(t) {
          var e = document.createElement("a");
          return e.href = t, "" === e.host && (e.href = e.href), e
        },
        isSameOrigin: (r, o) => (r = e.urlParse(r), (o = (o = o && [].concat(o) || []).map(e.urlParse)).push(t.location), (o = o.filter((function (t) {
          let e = r.hostname === t.hostname,
            o = r.protocol === t.protocol,
            s = r.port === t.port || "" === t.port && ("80" === r.port || "443" === r.port);
          return e && o && s
        }))).length >= 1)
      };
      return e
    }
    t.$inject = ["$window"], angular.module("marketWatcherApp.util").factory("Util", t)
  }();

angular.module("marketWatcherApp").run(["$templateCache", function ($templateCache) {
  $templateCache.put("components/chart/chart.html", "<div id=\"chart\" name=\"chart\" style=\"height:600px\">\r\n\r\n</div>\r\n\r\n<!-- TradingView Widget BEGIN -->\r\n<!--\r\n<script type=\"text/javascript\">\r\n\r\n</script>\r\n-->\r\n<!-- TradingView Widget END -->\r\n\r\n\r\n\r\n");
  $templateCache.put("components/footer/footer.html", "<div class=\"container\">\n  <!--\n  <p>Angular Fullstack v3.7.6 |\n    <a href=\"https://twitter.com/tyhenkel\">@tyhenkel</a> |\n    <a href=\"https://github.com/DaftMonk/generator-angular-fullstack/issues?state=open\">Issues</a>\n  </p>\n  -->\n</div>\n");
  $templateCache.put("components/modal/modal.html", "<div class=\"container-fluid modal-container-fluid\">\r\n    <div class=\"modal-header\">\r\n        <button ng-if=\"modal.dismissable\" type=\"button\" ng-click=\"$dismiss()\" class=\"close\">&times;</button>\r\n        <h4 ng-if=\"modal.title\" ng-bind=\"modal.title\" class=\"modal-title\"></h4>\r\n    </div>\r\n    <div class=\"modal-body\">\r\n        <ng-transclude></ng-transclude>\r\n    </div>\r\n\r\n    <div class=\"modal-footer\">\r\n        <button ng-repeat=\"button in modal.buttons\" ng-class=\"button.classes\" ng-click=\"button.click($event)\" ng-bind=\"button.text\"\r\n            class=\"btn\"></button>\r\n    </div>\r\n\r\n\r\n</div>");
  $templateCache.put("components/navbar/navbar.html", "<div class=\"navbar navbar-default navbar-fixed-top navbar-inverse\" ng-controller=\"NavbarController\">\n  <div class=\"container\">\n    <div class=\"navbar-header\">\n      <div>\n        <button class=\"navbar-toggle pull-left\" data-toggle=\"collapse\" type=\"button\" ng-click=\"nav.isCollapsed = !nav.isCollapsed\">\n          <span class=\"sr-only\">Toggle navigation</span>\n          <span class=\"icon-bar\"></span>\n          <span class=\"icon-bar\"></span>\n          <span class=\"icon-bar\"></span>\n        </button>\n        <a href=\"/\" class=\"navbar-brand\">Market Watch</a>\n        <ng-transclude></ng-transclude>\n      </div>\n    </div>\n\n    <!-- <div class=\"navbar navbar-nav  navbar-right\" ng-transclude></div> -->\n\n    <div uib-collapse=\"nav.isCollapsed\" class=\"navbar-collapse collapse\" id=\"navbar-main\">\n      <ul class=\"nav navbar-nav\">\n        <li ng-repeat=\"item in nav.menu\" ui-sref-active=\"active\" ng-click=\"nav.isCollapsed=true\">\n          <a data-toggle=\"collapse\" ui-sref=\"{{item.state}}\">{{item.title}}</a>\n        </li>\n        <li ng-show=\"nav.isAdmin()\" ui-sref-active=\"active\">\n          <a ui-sref=\"admin\">Admin</a>\n        </li>\n      </ul>\n\n      <ul class=\"nav navbar-nav navbar-right\">\n        <li>\n          <a href=\"#\" id=\"custom-button\"> Trade Basket </a>\n        </li>\n        <li ng-hide=\"nav.isLoggedIn()\" ui-sref-active=\"active\">\n          <a ui-sref=\"signup\">Sign up</a>\n        </li>\n        <li ng-hide=\"nav.isLoggedIn()\" ui-sref-active=\"active\">\n          <a ui-sref=\"login\">Login</a>\n        </li>\n        <li ng-show=\"nav.isLoggedIn()\">\n          <p class=\"navbar-text\">{{ nav.getCurrentUser().name }}</p>\n        </li>\n        <li ng-show=\"nav.isLoggedIn()\" ui-sref-active=\"active\">\n          <a ui-sref=\"settings\">\n            <span class=\"glyphicon glyphicon-cog\"></span>\n          </a>\n        </li>\n        <li ng-show=\"nav.isLoggedIn()\">\n          <a ui-sref=\"logout\">Logout</a>\n        </li>\n      </ul>\n\n\n    </div>\n\n    <!--\n    <div class=\"btn btn-small\">\n        <a href=\"javascript:\" data-kite=\"34dvxrlj3l08i9tv\"\n        data-exchange=\"NFO\"\n        data-tradingsymbol=\"SBIN17DEC155CE\"\n        data-transaction_type=\"SELL\"\n        data-quantity=\"3000\"\n        data-order_type=\"LIMIT\">Buy SBI stock</a>\n\n        <button data-kite=\"34dvxrlj3l08i9tv\"\n        data-exchange=\"NFO\"\n        data-tradingsymbol=\"SBIN17DEC155CE\"\n        data-transaction_type=\"SELL\"\n        data-quantity=\"3000\"\n        data-order_type=\"LIMIT\" >test</button>\n\n    <button id=\"custom-button\">Buy the basket</button>\n    </div>\n -->\n\n  </div>\n</div>");
  $templateCache.put("components/option-chain/option-chain.html", "<!--  <h3>Option Chain</h3> -->\r\n<div class=\"row slim gutter-1\">\r\n\r\n    <div class=\"col-md-12 col-xs-12 col-sm-12\">\r\n        <div class=\"btn-group btn-group-xs\" ng-if=\"symbol.quote\">\r\n            <label class=\"btn btn-active \">\r\n                <small>\r\n                    Margin:\r\n                </small>\r\n            </label>\r\n            <label class=\"btn slim btn-active \">\r\n                <span ng-class=\"\'quote-pchg-\'+ ( ((-(symbol.frontMonthMarginPercent * symbol.frontMonthLotSize * symbol.quote.ltP)/1000 + 100) || 0)  | moveSize : [0,20,50])\">\r\n                    {{0.15 * symbol.frontMonthLotSize * symbol.quote.ltP | number : 0}}\r\n                </span>\r\n            </label>\r\n            <label class=\"btn slim btn-active \">\r\n                <small>\r\n                    Lot:\r\n                </small>\r\n            </label>\r\n            <label class=\"btn slim btn-active \">\r\n                <span>\r\n                    {{symbol.frontMonthLotSize | number : 0}}\r\n                </span>\r\n            </label>\r\n            <label class=\"btn slim btn-active \"> {{symbol.quote.ltP | currency}}</label>\r\n            <label class=\"btn slim btn-active \">\r\n                <span ng-class=\"\'quote-pchg-\'+ (symbol.quote.per | moveSize : [2,5,7])\">\r\n                    {{symbol.quote.per| number:1 }}%\r\n                </span>\r\n            </label>\r\n            <label class=\"btn slim btn-active \">\r\n                <span ng-class=\"\'quote-pchg-\'+ (symbol.quote.mPC || 0 | moveSize : [5,9,15])\">\r\n                    {{symbol.quote.mPC| number:1 }}%\r\n                </span>\r\n            </label>\r\n            <label class=\"btn slim btn-active \">\r\n                <span ng-class=\"\'quote-pchg-\'+ (symbol.quote.yPC || 0 | moveSize : [10,15,20])\">\r\n                    {{symbol.quote.yPC | number:1}}%\r\n                </span>\r\n            </label>\r\n\r\n            <!--             //TD: Move to Directive -->\r\n            <label class=\"btn slim btn-warning disabled\" ng-show=\"symbol.daysToEarnings < 36\">\r\n                <span class=\"badge\">\r\n                    <small>\r\n                        E{{symbol.daysToEarnings + ((!symbol.nextEarnings)?\'?\':null) }}\r\n                    </small>\r\n                </span>\r\n            </label>\r\n\r\n            <label class=\"btn slim btn-active\">\r\n                <span class=\"text-right\">\r\n\r\n                </span>\r\n            </label>\r\n        </div>\r\n    </div>\r\n</div>\r\n<table class=\"table table-bordered table-condensed label text-center\">\r\n    <thead>\r\n        <tr class=\"label-primary gutter-2\">\r\n            <th class=\"col-md-1 col-xs-1 col-sm-1 text-center\">\r\n                <div>oi-k </div>\r\n            </th>\r\n            <th class=\"col-md-1 col-xs-1 col-sm-1 text-center\">vol</th>\r\n            <th class=\"col-md-1 col-xs-1 col-sm-1 text-center\">iv</th>\r\n            <th class=\"col-md-2 col-xs-1 col-sm-1 text-center\">\r\n                <div class=\"col-md-1\">bid / </div>\r\n                <div class=\"col-md-1\">ask\r\n                    <small>\r\n                        <small>(ch)</small>\r\n                    </small>\r\n                </div>\r\n            </th>\r\n            <th class=\"col-md-1 col-xs-1 col-sm-1 text-center\">sp</th>\r\n            <th class=\"col-md-1 col-xs-1 col-sm-1 text-center\">\r\n                <div>oi-k </div>\r\n                <div>\r\n                    <small>\r\n                        <small>(ch)</small>\r\n                    </small>\r\n                </div>\r\n            </th>\r\n            <th class=\"col-md-1 col-xs-1 col-sm-1 text-center\">vol</th>\r\n            <th class=\"col-md-1 col-xs-1 col-sm-1 text-center\">iv</th>\r\n            <th class=\"col-md-2 col-xs-1 col-sm-1 text-center\">\r\n                <div class=\"col-md-1\">bid / </div>\r\n                <div class=\"col-md-1\">ask\r\n                    <small>\r\n                        <small>(ch)</small>\r\n                    </small>\r\n                </div>\r\n            </th>\r\n        </tr>\r\n    </thead>\r\n    <tbody>\r\n        <tr class=\"label-active\">\r\n            <td colspan=9>\r\n                {{oc.expDt }} ( {{oc.expDays}} )\r\n            </td>\r\n        </tr>\r\n        <tr ng-repeat=\"strike in oc.strikes | orderBy: \'price\' | limitTo:200\" class=\"gutter-2\" ng-show=\"((strike.price <= sdH2) && (strike.price >= sdL2))\">\r\n            <td class=\"col-md-1 col-xs-1 col-sm-1\" ng-class=\"getMoneynessClass(strike.price,true)\">\r\n                <div>{{strike.call.oi/1000 | number : 0 }} </div>\r\n                <div>\r\n                    <small>\r\n                        <small> ({{strike.call.chngInOI/1000}})\r\n                </div>\r\n            </td>\r\n            <td class=\"col-md-1 col-xs-1 col-sm-1\" ng-class=\"getMoneynessClass(strike.price,true)\">{{strike.call.vol}}</td>\r\n            <td class=\"col-md-1 col-xs-1 col-sm-1\" ng-class=\"getMoneynessClass(strike.price,true)\">{{strike.call.iv | number : 0}}</td>\r\n            <td class=\"col-md-2 col-xs-1 col-sm-1\" ng-class=\"getMoneynessClass(strike.price,true)\">\r\n                <div class=\"col-md-1\" ng-click=\"addCallOption(strike)\">{{strike.call.bid}} / </div>\r\n                <div class=\"col-md-1\"> {{strike.call.ask}}\r\n                    <small>\r\n                        <small>\r\n                            ({{strike.call.netChng}})\r\n                        </small>\r\n                    </small>\r\n                </div>\r\n            </td>\r\n            <td class=\"col-md-1 col-xs-1 col-sm-1 label-active\" id=\"anchor{{strike.price}}\">{{strike.price}}</td>\r\n            <td class=\"col-md-1 col-xs-1 col-sm-1\" ng-class=\"getMoneynessClass(strike.price)\">\r\n                <div>{{strike.put.oi/1000 | number : 0 }}</div>\r\n                <div>\r\n                    <small>\r\n                        <small>\r\n                            ({{strike.put.chngInOI/1000}})\r\n                        </small>\r\n                    </small>\r\n                </div>\r\n            </td>\r\n            <td class=\"col-md-1 col-xs-1 col-sm-1\" ng-class=\"getMoneynessClass(strike.price)\">{{strike.put.vol}}</td>\r\n            <td class=\"col-md-1 col-xs-1 col-sm-1\" ng-class=\"getMoneynessClass(strike.price)\">{{strike.put.iv | number : 0}}</td>\r\n            <td class=\"col-md-2 col-xs-1 col-sm-1\" ng-class=\"getMoneynessClass(strike.price)\">\r\n                <div class=\"col-md-1\" ng-click=\"addPutOption(strike)\">{{strike.put.bid}} / </div>\r\n                <div class=\"col-md-1\"> {{strike.put.ask}}\r\n                    <small>\r\n                        <small>\r\n                            ({{strike.put.netChng}})\r\n                        </small>\r\n                    </small>\r\n                </div>\r\n            </td>\r\n        </tr>\r\n    </tbody>\r\n\r\n</table>\r\n<div class=\"col-md-12 col-xs-12 col-sm-12 text-center\">\r\n    <span class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate fa-4x\" ng-show=\"!oc\"></span>\r\n</div>");
  $templateCache.put("app/admin/admin.html", "<div class=\"container\">\n  <p>The delete user and user index api routes are restricted to users with the \'admin\' role.</p>\n  <ul class=\"list-group user-list\">\n    <li class=\"list-group-item\" ng-repeat=\"user in admin.users\">\n	    <div class=\"user-info\">\n	        <strong>{{user.name}}</strong><br>\n	        <span class=\"text-muted\">{{user.email}}</span>\n	    </div>\n        <a ng-click=\"admin.delete(user)\" class=\"trash\"><span class=\"fa fa-trash fa-2x\"></span></a>\n    </li>\n  </ul>\n</div>\n");
  $templateCache.put("app/events/events.html", "<div class=\"container-fluid\">\r\n    <!--  <img ng-src=\"{{event.imageUrl}}\" alt=\"{{event.name}}\"> -->\r\n\r\n    <h4>\r\n        <!-- Simple dropdown -->\r\n        <span uib-dropdown on-toggle=\"toggled(open)\">\r\n      <a href id=\"simple-dropdown\" uib-dropdown-toggle>\r\n        {{ symbolsGridCtrl.watchlist.name }}\r\n      </a>\r\n      <ul class=\"dropdown-menu\" uib-dropdown-menu aria-labelledby=\"simple-dropdown\">\r\n        <li ng-repeat=\"choice in items\">\r\n          <a href>{{choice}}</a>\r\n        </li>\r\n      </ul>\r\n    </span> Events\r\n\r\n    </span>\r\n    </h4>\r\n\r\n\r\n\r\n\r\n\r\n    <!-- Gutter3 = reduced padding -->\r\n    <div class=\"row gutter-2\">\r\n\r\n        <!--TD// new row after every four -->\r\n        <!-- correctly reduce padding\r\n      <!--Use a filter to identify selected instead of manipulating the model -->\r\n        <div class=\"col-md-3 col-xs-12 cols-sm-4\" ng-repeat=\"event in eventsCtrl.events | orderBy: \'boardMeetingDate\' | limitTo:20 \">\r\n\r\n            <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    <strong> {{event.symbol | uppercase}} </strong>\r\n            </div>\r\n\r\n            <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                <strong> {{event.boardMeetingDate | date : \'dd-MMM\': \'+0530\' }} </strong>\r\n            </div>\r\n\r\n            <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                <small><small>{{event.purpose | limitTo:60}}</small></small>\r\n            </div>\r\n\r\n            <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                <small><small>{{event.watchlists.toString() | limitTo:60}}</small></small>\r\n            </div>\r\n\r\n\r\n        </div>\r\n\r\n    </div>\r\n\r\n\r\n</div>");
  $templateCache.put("app/main/main.html", "<header class=\"hero-unit\" id=\"banner\">\n  <div class=\"container\">\n    <h1>Welcome</h1>\n    <p class=\"lead\">Marketwatcher</p>\n    <img src=\"assets/images/yeoman-1cab7d4d37.png1\" alt=\"Market Watcher\">\n  </div>\n</header>\n\n<div class=\"container\">\n  <div class=\"row\">\n    <div class=\"col-lg-12\">\n      <h1 class=\"page-header\">Features:</h1>\n      <ul class=\"nav nav-tabs nav-stacked col-md-4 col-lg-4 col-sm-6\" ng-repeat=\"thing in $ctrl.awesomeThings\">\n        <li><a href=\"#\" uib-tooltip=\"{{thing.info}}\">{{thing.name}}<button type=\"button\" class=\"close\" ng-click=\"$ctrl.deleteThing(thing)\">&times;</button></a></li>\n      </ul>\n    </div>\n  </div>\n\n  <form class=\"thing-form\">\n    <label>Syncs in realtime across clients</label>\n    <p class=\"input-group\">\n      <input type=\"text\" class=\"form-control\" placeholder=\"Add a new thing here.\" ng-model=\"$ctrl.newThing\">\n      <span class=\"input-group-btn\">\n        <button type=\"submit\" class=\"btn btn-primary\" ng-click=\"$ctrl.addThing()\">Add New</button>\n      </span>\n    </p>\n  </form>\n</div>\n");
  $templateCache.put("app/market-analysis/market-analysis.html", "<div class=\"container-fluid\">\r\n    <!--  <img ng-src=\"{{marketAnalysisCtrl.imageUrl}}\" alt=\"{{marketAnalysisCtrl.name}}\"> -->\r\n\r\n    <h4>\r\n        <!-- Simple dropdown -->\r\n        <!-- <span uib-dropdown on-toggle=\"toggled(open)\">\r\n            <a href id=\"simple-dropdown\" uib-dropdown-toggle>\r\n\r\n            </a>\r\n            <ul class=\"dropdown-menu\" uib-dropdown-menu aria-labelledby=\"simple-dropdown\">\r\n                <li ng-repeat=\"choice in items\">\r\n                    <a href>{{choice}}</a>\r\n                </li>\r\n            </ul>\r\n        </span> -->\r\n        Daily Quote Summary\r\n        </span>\r\n    </h4>\r\n\r\n    <div class=\"row gutter-2\">\r\n\r\n                    <!--TD// new row after every four -->\r\n                    <!-- correctly reduce padding -->\r\n                  <!--Use a filter to identify selected instead of manipulating the model -->\r\n                    <div class=\"col-md-12 col-xs-12 cols-sm-12\">\r\n\r\n                        <div class=\"col-md-2 col-xs-2 col-sm-2\">\r\n                                <small><strong>Date</strong></small>\r\n                        </div>\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                            <small><strong>UL#</strong></small>\r\n                        </div>\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                                <small><strong>Vol</strong></small>\r\n                        </div>\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                                <small><strong>T/O</strong></small>\r\n                        </div>\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                                <small><strong>ROC</strong></small>\r\n                        </div>\r\n\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                                <small><strong>C: P:</strong></small>\r\n                        </div>\r\n\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                                <small><strong>Ex H/L</strong></small>\r\n                        </div>\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                                <small><strong>BA%</strong></small>\r\n                        </div>\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                                <small><strong>IV</strong></small>\r\n                        </div>\r\n\r\n                        <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                                <small><strong>OI</strong></small>\r\n                        </div>\r\n\r\n                    </div>\r\n\r\n                </div>\r\n\r\n\r\n    <!-- Gutter3 = reduced padding -->\r\n    <div class=\"row gutter-2\">\r\n\r\n        <!--TD// new row after every four -->\r\n        <!-- correctly reduce padding -->\r\n      <!--Use a filter to identify selected instead of manipulating the model -->\r\n        <div class=\"col-md-12 col-xs-12 cols-sm-12\" ng-repeat=\"ds in marketAnalysisCtrl.dailyStat | orderBy: \'-_id\' | limitTo:35 \">\r\n\r\n            <div class=\"col-md-2 col-xs-2 col-sm-2\">\r\n                    <small>{{ds._id}}</small>\r\n            </div>\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                <small>{{ds.quotestats.totalSymbols | number}}</small>\r\n            </div>\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                    <small>{{ds.quotestats.avgVol | number : 0 }}</small>\r\n            </div>\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                    <small>{{ds.quotestats.avgTurnover | number : 0}}</small>\r\n            </div>\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                    <small>{{ds.quotestats.avgMaxROC | number : 1}}</small>\r\n            </div>\r\n\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                    <small><strong>C: P:</strong></small>\r\n            </div>\r\n\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                    <small>{{ds.quotestats.avgExpHiPer | number : 1}}  {{ds.quotestats.avgExpLowPer | number : 1}}</small>\r\n            </div>\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                    <small>{{ds.quotestats.avgCallBA | number : 1}}  {{ds.quotestats.avgPutBA | number : 1}}</small>\r\n            </div>\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                    <small>{{ds.quotestats.avgCallIV | number : 1}}  {{ds.quotestats.avgPutIV | number : 1}}</small>\r\n            </div>\r\n\r\n            <div class=\"col-md-1 col-xs-1 col-sm-1\">\r\n                    <small>{{ds.quotestats.avgCallOI/100000 | number : 1}}  {{ds.quotestats.avgPutOI/100000 | number : 1}}</small>\r\n            </div>\r\n\r\n        </div>\r\n\r\n    </div>\r\n\r\n\r\n</div>");
  $templateCache.put("app/symbolsGrid/symbolsGrid.html", "<div class=\"container-fluid\">\r\n  <!--  <img ng-src=\"{{event.imageUrl}}\" alt=\"{{event.name}}\"> -->\r\n  <div class=\"row\">\r\n    <h4>\r\n\r\n      <!-- Simple dropdown -->\r\n      <span uib-dropdown on-toggle=\"toggled(open)\">\r\n        <a href id=\"simple-dropdown\" uib-dropdown-toggle>\r\n          {{ symbolsGridCtrl.selectedWatchlist.name }}\r\n        </a>\r\n        <ul class=\"dropdown-menu\" uib-dropdown-menu aria-labelledby=\"simple-dropdown\">\r\n          <li ng-repeat=\"choice in symbolsGridCtrl.watchlistChoices\" ng-click=\"symbolsGridCtrl.changeWatchlist(choice)\">\r\n            <a href=\"#\">{{choice.name}}</a>\r\n          </li>\r\n        </ul>\r\n      </span>\r\n      <span class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\" ng-show=\"!symbolsGridCtrl.quoteTime\"></span>\r\n      <span ng-show=\"symbolsGridCtrl.quoteTime\">\r\n        <small>\r\n          <small>as on {{ symbolsGridCtrl.quoteTime | date : \'HH:mm\' : \'+0530\'}} IST fetched at {{symbolsGridCtrl.refreshTime |\r\n            date : \'dd-MMM HH:mm\' : \'+0800\'}} SGT </small>\r\n        </small>\r\n\r\n      </span>\r\n\r\n      <span ng-show=\"symbolsGridCtrl.quoteTime\">\r\n        <small>\r\n          <small>\r\n            8 hrs to market close Market is closed. Next Trading Date is Mon,18-Mar\r\n          </small>\r\n\r\n      </span>\r\n\r\n    </h4>\r\n\r\n\r\n  </div>\r\n\r\n  <!-- Split button -->\r\n  <div class=\"btn-toolbar\" role=\"toolbar\">\r\n\r\n    <div class=\"btn-group\" uib-dropdown>\r\n      <button id=\"split-button\" type=\"button\" class=\"btn btn-sm btn-info\">Sort</button>\r\n      <button type=\"button\" class=\"btn btn-sm btn-info\" uib-dropdown-toggle>\r\n        <span class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\"></span>\r\n        <span class=\"sr-only\">Sort</span>\r\n      </button>\r\n      <ul class=\"dropdown-menu\" uib-dropdown-menu role=\"menu\" aria-labelledby=\"split-button\">\r\n        <!-- <li class=\"dropdown-header\">Dropdown header</li> -->\r\n\r\n\r\n        <li role=\"menuitem\">\r\n          <a ng-click=\"symbolsGridCtrl.setSortBy(\'symbol\')\" href=\"\">\r\n            <span class=\"glyphicon\" ng-class=\"(symbolsGridCtrl.getReverse(\'symbol\'))?\'glyphicon-sort-by-alphabet-alt\':\'glyphicon-sort-by-alphabet\'\"></span> Symbol\r\n          </a>\r\n        </li>\r\n\r\n        <li role=\"menuitem\">\r\n          <a ng-click=\"symbolsGridCtrl.setSortBy(\'quote.per\')\" href=\"\">\r\n            <span class=\"glyphicon\" ng-class=\"(symbolsGridCtrl.getReverse(\'quote.per\'))?\'glyphicon-sort-by-attributes\':\'glyphicon-sort-by-attributes-alt\'\"></span> Daily %\r\n          </a>\r\n        </li>\r\n\r\n        <li role=\"menuitem\">\r\n          <a ng-click=\"symbolsGridCtrl.setSortBy(\'quote.mPC\')\" href=\"\">\r\n            <span class=\"glyphicon\" ng-class=\"(symbolsGridCtrl.getReverse(\'quote.mPC\'))?\'glyphicon-sort-by-attributes\':\'glyphicon-sort-by-attributes-alt\'\"></span> Monthly %\r\n          </a>\r\n        </li>\r\n\r\n        <li role=\"menuitem\">\r\n          <a ng-click=\"symbolsGridCtrl.setSortBy(\'quote.yPC\')\" href=\"\">\r\n            <span class=\"glyphicon\" ng-class=\"(symbolsGridCtrl.getReverse(\'quote.yPC\'))?\'glyphicon-sort-by-attributes\':\'glyphicon-sort-by-attributes-alt\'\"></span> Yearly %\r\n          </a>\r\n        </li>\r\n\r\n\r\n        <li class=\"divider\"></li>\r\n\r\n        <li role=\"menuitem\">\r\n          <a ng-click=\"symbolsGridCtrl.setSortBy(\'quote.maxROC\')\" href=\"\">\r\n            <span class=\"glyphicon\" ng-class=\"(symbolsGridCtrl.getReverse(\'quote.maxROC\'))?\'glyphicon-sort-by-attributes\':\'glyphicon-sort-by-attributes-alt\'\"></span> ROC%\r\n          </a>\r\n        </li>\r\n\r\n        <li role=\"menuitem\">\r\n          <a ng-click=\"symbolsGridCtrl.setSortBy(\'daysToEarnings\')\" href=\"\">\r\n            <span class=\"glyphicon\" ng-class=\"(!symbolsGridCtrl.getReverse(\'daysToEarnings\'))?\'glyphicon-sort-by-attributes\':\'glyphicon-sort-by-attributes-alt\'\"></span> DTE\r\n          </a>\r\n        </li>\r\n\r\n      </ul>\r\n    </div>\r\n\r\n    <div class=\"btn-group\" uib-dropdown auto-close=\"outsideClick\">\r\n      <button id=\"split-button\" type=\"button\" class=\"btn btn-sm btn-info\">Filter</button>\r\n      <button type=\"button\" class=\"btn btn-sm btn-info\" uib-dropdown-toggle>\r\n        <span class=\"glyphicon glyphicon-filter\" aria-hidden=\"true\"></span>\r\n        <span class=\"sr-only\">Filter</span>\r\n      </button>\r\n      <ul class=\"dropdown-menu\" uib-dropdown-menu role=\"menu\" aria-labelledby=\"split-button\" style=\"padding:10px;\">\r\n        <!-- <li class=\"dropdown-header\">Dropdown header</li> -->\r\n        <form class=\"form\">\r\n\r\n          <li role=\"menuitem\">\r\n            <div class=\"input-group\">\r\n              <input id=\"symbName\" name=\"symbName\" class=\"form-control\" type=\"text\" required ng-pattern=\"/^[a-zA-Z0-9]*$/\" ng-model=\"symbolsGridCtrl.query.key\"\r\n                placeholder=\"symbol or name\" />\r\n              <span class=\"input-group-addon\" ng-click=\"symbolsGridCtrl.query.key=\'\'\">\r\n                <span class=\"glyphicon glyphicon-remove label-success\" ng-click=\"symbolsGridCtrl.query.key=\'\'\"></span>\r\n              </span>\r\n            </div>\r\n\r\n            <!-- <br> key : <div ng-bind-html=\"$sce.trustAsHtml(symbolsGridCtrl.query.key)\"> </div> -->\r\n          </li>\r\n\r\n          <li class=\"divider\"></li>\r\n\r\n          <li role=\"menuitem\">\r\n            <input id=\"incEarnings\" name=\"incEarnings\" type=\"checkbox\" ng-model=\"symbolsGridCtrl.incEarnings\"> Include Earnings\r\n          </li>\r\n\r\n          <li role=\"menuitem\">\r\n            <input id=\"earningsOnly\" name=\"earningsOnly\" type=\"checkbox\" ng-model=\"symbolsGridCtrl.earningsOnly\"> Earnings Only\r\n          </li>\r\n\r\n        </form>\r\n      </ul>\r\n    </div>\r\n  </div>\r\n\r\n  <div>\r\n    <span>\r\n      <small>\r\n        <small>\r\n          Front Month Expiry is on Wed, 28-Mar-18 7 days to front month expiry (Wed, 28-Mar-18) Fri, 30-Mar is trading holiday\r\n        </small>\r\n      </small>\r\n    </span>\r\n  </div>\r\n\r\n  <br>\r\n\r\n\r\n  <!-- Gutter3 = reduced padding -->\r\n  <uib-accordion close-others=\"true\">\r\n    <div class=\"row gutter-3\">\r\n\r\n      <!--TD// new row after every four -->\r\n      <!-- correctly reduce padding -->\r\n      <!-- Use a filter to identify selected instead of manipulating the model -->\r\n\r\n      <div class=\"col-md-3 col-xs-12 cols-sm-4\" ng-repeat=\"symbol in symbolsGridCtrl.watchlist.symbols | orderBy:symbolsGridCtrl.getSortOrder:symbolsGridCtrl.sortReverse | limitTo:200 | filter:symbolsGridCtrl.query track by symbol._id\">\r\n        <uib-accordion-group id=\"anchor-{{symbol.symbol}}\" class=\"{{\'panel-rounded \' + ((symbol.symbol == symbolsGridCtrl.selectedSymbol) ? \'panel-primary\' : \'panel-default\') }}\"\r\n          ng-click=\"symbolsGridCtrl.toggleSelectedSymbol(symbol.symbol)\" ng-if=\"((symbol.quote.expectedHighPercent > 0) &&(!symbol.nextEarningsBeforeFrontMonthExpiry || symbolsGridCtrl.incEarnings) && (!symbolsGridCtrl.earningsOnly || (symbol.daysToEarnings <=3  && symbol.nextEarnings)) )\">\r\n\r\n\r\n          <uib-accordion-heading>\r\n            <div class=\"row gutter-2\">\r\n              <div class=\"col-md-4 col-xs-4 col-sm-4\">\r\n                <h5 class=\"panel-title\">\r\n                  <strong> {{symbol.symbol | uppercase}} </strong>\r\n                </h5>\r\n              </div>\r\n              <div class=\"col-md-8 col-xs-8 col-sm-8 pull-right\">\r\n                <div class=\"btn-group btn-group-xs pull-right\" ng-if=\"symbol.quote\">\r\n\r\n                  <label class=\"btn btn-active \"> {{symbol.quote.ltP | currency}}</label>\r\n                  <label class=\"btn btn-active \">\r\n                    <span ng-class=\"\'quote-pchg-\'+ (symbol.quote.per | moveSize : [2,5,7])\">\r\n                      {{symbol.quote.per| number:1 }}%\r\n                    </span>\r\n                  </label>\r\n                  <label class=\"btn btn-active \">\r\n                    <span ng-class=\"\'quote-pchg-\'+ (symbol.quote.mPC || 0 | moveSize : [5,9,15])\">\r\n                      {{symbol.quote.mPC| number:1 }}%\r\n                    </span>\r\n                  </label>\r\n                  <label class=\"btn btn-active \">\r\n                    <span ng-class=\"\'quote-pchg-\'+ (symbol.quote.yPC || 0 | moveSize : [10,15,20])\">\r\n                      {{symbol.quote.yPC | number:1}}%\r\n                    </span>\r\n                  </label>\r\n\r\n                  <!--             //TD: Move to Directive -->\r\n                  <label class=\"btn slim btn-warning disabled\" ng-show=\"symbol.daysToEarnings < 36\">\r\n                    <span class=\"badge\">\r\n                      <small>\r\n                        E{{symbol.daysToEarnings + ((!symbol.nextEarnings)?\'?\':null) }}\r\n                      </small>\r\n                    </span>\r\n                  </label>\r\n                </div>\r\n              </div>\r\n            </div>\r\n\r\n            <div class=\"row gutter-2\">\r\n              <div class=\"col-md-12 col-xs-12 col-sm-12\">\r\n                <small>\r\n                  <small>{{symbol.name | limitTo:60}} ({{symbol.industry | limitTo:60}})</small>\r\n                </small>\r\n              </div>\r\n              <div class=\"col-md-6 col-xs-6 col-sm-6\">\r\n              </div>\r\n            </div>\r\n          </uib-accordion-heading>\r\n\r\n          <div class=\"row gutter-3\">\r\n            <div class=\"panel-group\">\r\n              <div class=\"panel panel-body panel-danger\">\r\n\r\n                <div class=\"row gutter-1\">\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Call ROC : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ ((symbol.quote.expectedHighCallROCPercent || 0) | moveSize : [7,10,12])\">\r\n                    {{symbol.quote.expectedHighCallROCPercent | number : 1 }}%\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Put ROC : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ ((symbol.quote.expectedLowPutROCPercent || 0) | moveSize : [7,10,12])\">\r\n                    {{symbol.quote.expectedLowPutROCPercent | number : 1 }}%\r\n                  </div>\r\n\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Lot Size : </small>\r\n                    </small>\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.frontMonthLotSize | number : 0}}\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Margin : </small>\r\n                    </small>\r\n                  </div>\r\n                  <!-- TD: Move to server -->\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ ( ((-(symbol.frontMonthMarginPercent * symbol.frontMonthLotSize * symbol.quote.ltP)/1000 + 100) || 0)  | moveSize : [0,20,50])\">\r\n                    {{0.15 * symbol.frontMonthLotSize * symbol.quote.ltP | number : 0}}\r\n                  </div>\r\n\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Call IV : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ ((symbol.quote.expectedHighOptions.call.iv-30) || 0| moveSize : [10,20,30])\">\r\n                    {{symbol.quote.expectedHighOptions.call.iv | number : 1 }}%\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Put IV : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ ((symbol.quote.expectedLowOptions.put.iv-30)  || 0| moveSize : [10,20,30])\">\r\n                    {{symbol.quote.expectedLowOptions.put.iv | number : 1 }}%\r\n                  </div>\r\n\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Call Bid Ask : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (-1*((symbol.quote.expectedHighOptions.call.perSpr||0) -5)  | moveSize : [1,3,5])\">\r\n                    {{symbol.quote.expectedHighOptions.call.perSpr | number : 1 }}%\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Put Bid Ask : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (-1*((symbol.quote.expectedLowOptions.put.perSpr||0) -5)  | moveSize : [1,3,5])\">\r\n                    {{symbol.quote.expectedLowOptions.put.perSpr | number : 1 }}%\r\n                  </div>\r\n                </div>\r\n\r\n              </div>\r\n\r\n\r\n              <div class=\"panel panel-body panel-info\">\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>52 Wk High : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.wkhi | currency}}\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>52 Wk Low : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.wklo | currency}}\r\n                  </div>\r\n\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Exp High : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.expectedHighPercent || 0 | moveSize : [5,9,15])\">\r\n                    {{symbol.quote.expectedHigh | currency}}\r\n                    <small>\r\n                      <small>\r\n                        {{symbol.quote.expectedHighPercent | number : 1}}%\r\n                      </small>\r\n                    </small>\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Exp Low : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.expectedLowPercent || 0 | moveSize : [5,9,15])\">\r\n                    {{symbol.quote.expectedLow | currency}}\r\n                    <small>\r\n                      <small>\r\n                        {{symbol.quote.expectedLowPercent | number : 1}}%\r\n                      </small>\r\n                    </small>\r\n                  </div>\r\n\r\n                </div>\r\n\r\n              </div>\r\n\r\n              <div class=\"panel panel-body panel-danger\">\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Call OI Chg : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.expectedHighOptions.call.perChngInOI || 0 | moveSize : [3,5,10])\">\r\n                    {{symbol.quote.expectedHighOptions.call.perChngInOI | number : 1 }}%\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Put OI Chg : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.expectedLowOptions.put.perChngInOI  || 0| moveSize : [3,5,10])\">\r\n                    {{symbol.quote.expectedLowOptions.put.perChngInOI | number : 1 }}%\r\n                  </div>\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Call OI(K) : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.expectedHighOptions.call.oi || 0 | moveSize : [3000,5000,10000])\">\r\n                    {{symbol.quote.expectedHighOptions.call.oi/1000 | number:0}}\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Put OI(K) : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.expectedLowOptions.put.oi || 0 | moveSize : [3000,5000,10000])\">\r\n                    {{symbol.quote.expectedLowOptions.put.oi/1000 | number:0}}\r\n                  </div>\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Call Vol : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.expectedHighOptions.call.vol || 0 | moveSize : [100,500,1000])\">\r\n                    {{symbol.quote.expectedHighOptions.call.vol | number:0}}\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Put Vol : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.expectedLowOptions.put.vol || 0 | moveSize : [100,500,1000])\">\r\n                    {{symbol.quote.expectedLowOptions.put.vol | number:0}}\r\n                  </div>\r\n\r\n                </div>\r\n              </div>\r\n\r\n              <div class=\"panel panel-body panel-info\">\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Prev Earnings : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    <small>\r\n                      {{symbol.previousEarnings | date : \'EEE,dd.MMM.yy\' : \'+0530\'}}\r\n                    </small>\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>{{symbol.nextEarnings?\'Next Earnings: \' : \'Proj. Earnings: \'}}</small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    <small>\r\n                      {{symbol.nextEarnings?symbol.nextEarnings:symbol.projectedEarnings | date : \'EEE,dd.MMM.yy\' : \'+0530\'}}\r\n                    </small>\r\n                  </div>\r\n\r\n                </div>\r\n              </div>\r\n\r\n\r\n              <div class=\"panel panel-body panel-danger\" ng-show=\"false\">\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Open : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.open | currency}}\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Change : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.ptsC | currency}}\r\n                    <!-- Close not available <-->\r\n                  </div>\r\n\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>High : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.high | currency}}\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Low : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.low | currency}}\r\n                  </div>\r\n\r\n                </div>\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Vol(L) : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.trdVol | number:1}}\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Value(Cr) : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.ntP | currency}}\r\n                  </div>\r\n\r\n                </div>\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Margin Rate : </small>\r\n                    </small>\r\n                  </div>\r\n\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.frontMonthMarginPercent * 100 | number : 1}}%\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Place Holder: </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                  </div>\r\n\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <!-- Not working on small devices -->\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Last Price : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    {{symbol.quote.ltP | currency}}\r\n                    <!-- TD: Convert to filter -->\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>Change% : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.per|| 0 | moveSize : [2,5,7])\">\r\n                    <!-- | movesize : [2,5,7] -->\r\n                    {{symbol.quote.per| number:1 }}%\r\n                  </div>\r\n\r\n                </div>\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>30D Chg : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.mPC || 0 | moveSize : [5,9,15])\">\r\n                    {{symbol.quote.mPC | number:1}}%\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                    <small>\r\n                      <small>52W Chg : </small>\r\n                    </small>\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\" ng-class=\"\'quote-pchg-\'+ (symbol.quote.yPC || 0 | moveSize : [10,15,20])\">\r\n                    {{symbol.quote.yPC | number:1}}%\r\n                  </div>\r\n\r\n                </div>\r\n\r\n\r\n              </div>\r\n\r\n              <div class=\"panel panel-body panel-default\">\r\n\r\n                <div class=\"row gutter-1\">\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    <button class=\"btn btn-primary btn-sm\" ng-click=\"symbolsGridCtrl.openOC(symbol)\">\r\n                      <span class=\"glyphicon glyphicon-link\"></span>\r\n                    </button>\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    <button class=\"btn btn-primary btn-sm\" ng-click=\"symbolsGridCtrl.openChart(symbol)\">\r\n                      <i class=\"fa fa-line-chart\"></i>\r\n                    </button>\r\n                  </div>\r\n\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3 text-right\">\r\n                  </div>\r\n                  <div class=\"col-md-3 col-xs-3 col-sm-3\">\r\n                    <button class=\"btn btn-primary btn-sm\" ng-click=\"symbolsGridCtrl.filterIndustry(symbol)\">\r\n                      <i class=\"fa fa-industry\"></i>\r\n                    </button>\r\n                  </div>\r\n\r\n\r\n                </div>\r\n\r\n              </div>\r\n\r\n            </div>\r\n\r\n\r\n          </div>\r\n\r\n\r\n\r\n        </uib-accordion-group>\r\n\r\n      </div>\r\n\r\n\r\n    </div>\r\n  </uib-accordion>\r\n</div>");
  $templateCache.put("app/account/login/login.html", "<div class=\"container\">\n  <div class=\"row\">\n    <div class=\"col-sm-12\">\n      <h1>Login</h1>\n      <p>Accounts are reset on server restart from <code>server/config/seed.js</code>. Default account is <code>test@example.com</code> / <code>test</code></p>\n      <p>Admin account is <code>admin@example.com</code> / <code>admin</code></p>\n    </div>\n    <div class=\"col-sm-12\">\n      <form class=\"form\" name=\"form\" ng-submit=\"vm.login(form)\" novalidate>\n\n        <div class=\"form-group\">\n          <label>Email</label>\n\n          <input type=\"email\" name=\"email\" class=\"form-control\" ng-model=\"vm.user.email\" required>\n        </div>\n\n        <div class=\"form-group\">\n          <label>Password</label>\n\n          <input type=\"password\" name=\"password\" class=\"form-control\" ng-model=\"vm.user.password\" required>\n        </div>\n\n        <div class=\"form-group has-error\">\n          <p class=\"help-block\" ng-show=\"form.email.$error.required && form.password.$error.required && vm.submitted\">\n             Please enter your email and password.\n          </p>\n          <p class=\"help-block\" ng-show=\"form.email.$error.email && vm.submitted\">\n             Please enter a valid email.\n          </p>\n\n          <p class=\"help-block\">{{ vm.errors.other }}</p>\n        </div>\n\n        <div>\n          <button class=\"btn btn-inverse btn-lg btn-login\" type=\"submit\">\n            Login\n          </button>\n          <a class=\"btn btn-default btn-lg btn-register\" ui-sref=\"signup\">\n            Register\n          </a>\n        </div>\n\n      </form>\n    </div>\n  </div>\n  <hr>\n</div>\n");
  $templateCache.put("app/account/signup/signup.html", "<div class=\"container\">\n  <div class=\"row\">\n    <div class=\"col-sm-12\">\n      <h1>Sign up</h1>\n    </div>\n    <div class=\"col-sm-12\">\n      <form class=\"form\" name=\"form\" ng-submit=\"vm.register(form)\" novalidate>\n\n        <div class=\"form-group\" ng-class=\"{ \'has-success\': form.name.$valid && vm.submitted,\n                                            \'has-error\': form.name.$invalid && vm.submitted }\">\n          <label>Name</label>\n\n          <input type=\"text\" name=\"name\" class=\"form-control\" ng-model=\"vm.user.name\"\n                 required/>\n          <p class=\"help-block\" ng-show=\"form.name.$error.required && vm.submitted\">\n            A name is required\n          </p>\n        </div>\n\n        <div class=\"form-group\" ng-class=\"{ \'has-success\': form.email.$valid && vm.submitted,\n                                            \'has-error\': form.email.$invalid && vm.submitted }\">\n          <label>Email</label>\n\n          <input type=\"email\" name=\"email\" class=\"form-control\" ng-model=\"vm.user.email\"\n                 required\n                 mongoose-error/>\n          <p class=\"help-block\" ng-show=\"form.email.$error.email && vm.submitted\">\n            Doesn\'t look like a valid email.\n          </p>\n          <p class=\"help-block\" ng-show=\"form.email.$error.required && vm.submitted\">\n            What\'s your email address?\n          </p>\n          <p class=\"help-block\" ng-show=\"form.email.$error.mongoose\">\n            {{ vm.errors.email }}\n          </p>\n        </div>\n\n        <div class=\"form-group\" ng-class=\"{ \'has-success\': form.password.$valid && vm.submitted,\n                                            \'has-error\': form.password.$invalid && vm.submitted }\">\n          <label>Password</label>\n\n          <input type=\"password\" name=\"password\" class=\"form-control\" ng-model=\"vm.user.password\"\n                 ng-minlength=\"3\"\n                 required\n                 mongoose-error/>\n          <p class=\"help-block\"\n             ng-show=\"(form.password.$error.minlength || form.password.$error.required) && vm.submitted\">\n            Password must be at least 3 characters.\n          </p>\n          <p class=\"help-block\" ng-show=\"form.password.$error.mongoose\">\n            {{ vm.errors.password }}\n          </p>\n        </div>\n\n        <div class=\"form-group\" ng-class=\"{ \'has-success\': form.confirmPassword.$valid && vm.submitted,\n                                            \'has-error\': form.confirmPassword.$invalid && vm.submitted }\">\n          <label>Confirm Password</label>\n          <input type=\"password\" name=\"confirmPassword\" class=\"form-control\" ng-model=\"vm.user.confirmPassword\"\n                 match=\"vm.user.password\"\n                 ng-minlength=\"3\" required/>\n          <p class=\"help-block\"\n             ng-show=\"form.confirmPassword.$error.match && vm.submitted\">\n            Passwords must match.\n          </p>\n        </div>\n\n        <div>\n          <button class=\"btn btn-inverse btn-lg btn-register\" type=\"submit\">\n            Sign up\n          </button>\n          <a class=\"btn btn-default btn-lg btn-login\" ui-sref=\"login\">\n            Login\n          </a>\n        </div>\n\n      </form>\n    </div>\n  </div>\n  <hr>\n</div>\n");
  $templateCache.put("app/account/settings/settings.html", "<div class=\"container\">\n  <div class=\"row\">\n    <div class=\"col-sm-12\">\n      <h1>Change Password</h1>\n    </div>\n    <div class=\"col-sm-12\">\n      <form class=\"form\" name=\"form\" ng-submit=\"vm.changePassword(form)\" novalidate>\n\n        <div class=\"form-group\">\n          <label>Current Password</label>\n\n          <input type=\"password\" name=\"password\" class=\"form-control\" ng-model=\"vm.user.oldPassword\"\n                 mongoose-error/>\n          <p class=\"help-block\" ng-show=\"form.password.$error.mongoose\">\n              {{ vm.errors.other }}\n          </p>\n        </div>\n\n        <div class=\"form-group\">\n          <label>New Password</label>\n\n          <input type=\"password\" name=\"newPassword\" class=\"form-control\" ng-model=\"vm.user.newPassword\"\n                 ng-minlength=\"3\"\n                 required/>\n          <p class=\"help-block\"\n             ng-show=\"(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || vm.submitted)\">\n            Password must be at least 3 characters.\n          </p>\n        </div>\n\n        <div class=\"form-group\">\n          <label>Confirm New Password</label>\n\n          <input type=\"password\" name=\"confirmPassword\" class=\"form-control\" ng-model=\"vm.user.confirmPassword\"\n                 match=\"vm.user.newPassword\"\n                 ng-minlength=\"3\"\n                 required=\"\"/>\n          <p class=\"help-block\"\n             ng-show=\"form.confirmPassword.$error.match && vm.submitted\">\n            Passwords must match.\n          </p>\n\n        </div>\n\n        <p class=\"help-block\"> {{ vm.message }} </p>\n\n        <button class=\"btn btn-lg btn-primary\" type=\"submit\">Save changes</button>\n      </form>\n    </div>\n  </div>\n</div>\n");
}]);
