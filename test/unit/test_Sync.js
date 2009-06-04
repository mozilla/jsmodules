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

// Async. functions that throw before going async should appear like normal
function test_Sync_exception() {
  try {
    Sync(function(cb) {
      throw "EARLY!";
    })();
    do_throw("Async. function should have thrown");
  }
  catch(ex) {
    do_check_eq(ex, "EARLY!");
  }
}

// Check that sync. callbacks can throw an exception to the sync. caller
function test_Sync_fail() {
  try {
    Sync(function(cb) {
      cb.fail("FAIL!");
    })();
    do_throw("Sync. callback should have thrown");
  }
  catch(ex) {
    do_check_eq(ex, "FAIL!");
  }
}

// Async. functions that throw go unnoticed
function test_Sync_async_exception() {
  // XXX We can't detect if an async. function fails.. :(
  return;

  Sync(function(cb) {
    setTimeout(function() {
      throw "undetected";
    }, 100);
  })();
}

// Check that async. functions can trigger an exception to the sync. caller
function test_Sync_async_fail() {
  let startTime = new Date();
  try {
    Sync(function(cb) {
      setTimeout(function() cb.fail("FAIL!"), 100)
    })();
    do_throw("Sync. callback should have thrown");
  }
  catch(ex) {
    do_check_eq(ex, "FAIL!");
    do_check_true(new Date() - startTime >= 95);
  }
}

// Check that sync. function callbacks can be extracted
function test_Sync_withCb() {
  let [add, cb] = Sync.withCb(slowAdd);
  checkTime(function() {
    let sum = add(cb, 100, 1000, 234);
    do_check_eq(sum, 1234);
  }, 100);
}

// Extract sync. function callback that uses "this"
function test_Sync_withCb_this() {
  let [get, cb] = Sync.withCb(slowThisGet, { foo: "bar"});
  checkTime(function() {
    let val = get(cb, 100, "foo");
    do_check_eq(val, "bar");
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

// Make sure private callback data isn't accessible
function test_callback_privates() {
  // Make sure we can't read any values out of the callback
  let checkAccess = function(cb) {
    do_check_eq(cb.state, null);
    do_check_eq(cb.value, null);
    do_check_eq(cb._().state, null);
    do_check_eq(cb._().value, null);
  };

  // Save the callback to use it after the sync. call
  let theCb;
  checkTime(Sync(function(cb) {
    // Make sure there's no access when the function is called
    checkAccess(cb);

    // Save the callback and continue execution after waiting a little
    setTimeout(theCb = cb, 100);
  }), 100);

  // Make sure there's no access after the sync. call
  checkAccess(theCb);
}
