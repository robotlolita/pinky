(function(){
  var defer, isThenable, isFunction, makePromiseFromThenable, makeBindings, toFulfilled, toRejected, applyPromise, attemptApplication, pinkyPromise;
  defer = (function(){
    switch (false) {
    case typeof setImmediate == 'undefined' || setImmediate === null:
      return setImmediate;
    case typeof process == 'undefined' || process === null:
      return process.nextTick;
    default:
      return function(it){
        return setTimeout(it, 0);
      };
    }
  }());
  isThenable = function(a){
    if (a) {
      return typeof a.then === 'function';
    }
  };
  isFunction = function(a){
    return typeof a === 'function';
  };
  makePromiseFromThenable = function(a){
    var p;
    p = pinkyPromise();
    a.then(p.fulfill, p.reject);
    return p;
  };
  makeBindings = function(fulfilled, failed, promise){
    return function(apply, value){
      return apply(value, fulfilled, failed, promise);
    };
  };
  toFulfilled = function(value, fulfilled, _, promise){
    return applyPromise(value, fulfilled, promise.fulfill, promise);
  };
  toRejected = function(value, _, rejected, promise){
    return applyPromise(value, rejected, promise.reject, promise);
  };
  applyPromise = function(value, handler, fallback, promise){
    var e;
    try {
      return attemptApplication(value, handler, fallback, promise);
    } catch (e$) {
      e = e$;
      return promise.reject(e);
    }
  };
  attemptApplication = function(value, handler, fallback, promise){
    var result;
    if (isFunction(handler)) {
      result = handler(value);
      if (isThenable(result)) {
        return result.then(promise.fulfill, promise.reject);
      } else {
        return promise.fulfill(result);
      }
    } else {
      return fallback(value);
    }
  };
  pinkyPromise = function(a){
    var addBindings, pending;
    addBindings = function(fulfilled, failed, promise){
      return pending.push(makeBindings(fulfilled, failed, promise));
    };
    return (function(args$){
      switch (false) {
      case !isThenable(a):
        return makePromiseFromThenable(a);
      case !args$.length:
        return pinkyPromise().fulfill(a);
      default:
        pending = [];
        return {
          then: addTransitionState,
          always: function(f){
            return addTransitionState(f, f);
          },
          otherwise: function(f){
            return addTransitionState(void 8, f);
          },
          fulfill: fulfill,
          reject: fail
        };
      }
    }(arguments));
    function addTransitionState(fulfilled, failed){
      var p2;
      p2 = pinkyPromise();
      addBindings(fulfilled, failed, p2);
      return p2;
    }
    function transition(state, value){
      (function(xs){
        defer(function(){
          var i$, ref$, len$, f;
          for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
            f = ref$[i$];
            f(state, value);
          }
        });
      }.call(this, pending));
      addBindings = function(k, f, p){
        return makeBindings(k, f, p)(state, value);
      };
      pending = [];
    }
    function fulfill(a){
      transition(toFulfilled, a);
      return this;
    }
    function fail(a){
      transition(toRejected, a);
      return this;
    }
    return fail;
  };
  module.exports = pinkyPromise;
}).call(this);