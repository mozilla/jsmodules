Components.utils.import("resource://jsmodules/Sync.js");

// Helper function to check how long a function takes to run
function time(func) {
  let startTime = new Date();
  func();
  return new Date() - startTime;
}

// Make sure the function took a certain amount of time to run
function checkTime(func, expect) {
  // Some reason the timer sometimes fire slightly early, so give some room
  do_check_true(time(func) >= expect - 5);
}

// Helper function to test sync functionality
function slowAdd(onComplete, wait, num1, num2) {
  setTimeout(function() onComplete(num1 + num2), wait);
}

function slowThisGet(onComplete, wait, prop) {
  // NB: this[prop] could be different if accessed after waiting
  let ret = this[prop];
  setTimeout(function() onComplete(ret), wait);
}

// Test the built-in Sync.sleep method.
function test_Sync_sleep() {
  checkTime(function() {
    Sync.sleep(100);
  }, 100);
}

// Make sure Sync.sleep can be called more than once
function test_Sync_multiple() {
  checkTime(function() {
    Sync.sleep(100);
    checkTime(function() {
      Sync.sleep(100);
      checkTime(function() {
        Sync.sleep(100);
      }, 100);
    }, 200);
  }, 300);
}

// Check that we can create a sync. function
function test_Sync() {
  checkTime(function() {
    let sum = Sync(slowAdd)(100, 1, 10);
    do_check_eq(sum, 11);
  }, 100);
}

// Check that we can create a sync. function that gets "this" set
function test_Sync_this() {
  checkTime(function() {
    let val = Sync(slowThisGet, { five: 5 })(100, "five");
    do_check_eq(val, 5);
  }, 100);
}

// Check that sync. function callbacks can be extracted
function test_Sync_withCb() {
  let [add, cb] = Sync.withCb(slowAdd);
  checkTime(function() {
    let sum = add(cb, 100, 1000, 234);
    do_check_eq(sum, 1234);
  }, 100);
}

// Test sync of async function that indirectly takes the callback
function test_Sync_withCb_indirect() {
  let [square, cb] = Sync.withCb(function(obj) {
    setTimeout(function() obj.done(obj.num * obj.num), obj.wait);
  });

  let thing = {
    done: cb,
    num: 3,
    wait: 100
  };

  checkTime(function() {
    let val = square(thing);
    do_check_eq(val, 9);
  }, 100);
}

// Test sync of async function that takes no args
function test_Sync_withCb_noargs() {
  // XXX Bug 496134 declare the variable before doing destructured assignment
  let makePi, done;
  [makePi, done] = Sync.withCb(function() {
    // Find PI by starting at 0.04 and adding 0.1 31 times
    let pi = 0.04;
    while (pi <= 3.14) {
      pi += 0.1;
      Sync.sleep(10);
    }
    done(pi);
  });

  checkTime(function() {
    let pi = makePi();
    do_check_eq(pi.toFixed(2), "3.14");
  }, 310);
}

// Make sure the exported Sync object/function has Function properties
function test_function_Sync() {
  // We can't check the functions directly because the Function object for Sync
  // and this test script are compiled against different globals. So do the next
  // best thing and check if they look the same: function call() [native code]
  do_check_eq(Sync.call.toSource(), Function.prototype.call.toSource());
  do_check_eq(Sync.apply.toSource(), Function.prototype.apply.toSource());
}
