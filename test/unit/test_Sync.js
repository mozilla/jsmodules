Components.utils.import("resource://jsmodules/Sync.js");

// Helper function to check how long a function takes to run
function time(func) {
  let startTime = new Date();
  func();
  return new Date() - startTime;
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
  let duration = time(function() {
    Sync.sleep(100);
  });
  do_check_true(duration >= 100);
}

// Check that we can create a sync. function
function test_Sync() {
  let duration = time(function() {
    let sum = Sync(slowAdd)(100, 1, 10);
    do_check_eq(sum, 11);
  });
  do_check_true(duration >= 100);
}

// Check that we can create a sync. function that gets "this" set
function test_Sync_this() {
  let duration = time(function() {
    let val = Sync(slowThisGet, { five: 5 })(100, "five");
    do_check_eq(val, 5);
  });
  do_check_true(duration >= 100);
}

// Check that sync. function callbacks can be extracted
function test_Sync_onComplete() {
  let add = Sync(slowAdd);
  let duration = time(function() {
    let sum = add(add.onComplete, 100, 1000, 234);
    do_check_eq(sum, 1234);
  });
  do_check_true(duration >= 100);
}

// Test sync of async function that indirectly takes the callback
function test_Sync_onComplete_indirect() {
  let square = Sync(function(obj) {
    setTimeout(function() obj.done(obj.num * obj.num), obj.wait);
  });

  let thing = {
    done: square.onComplete,
    num: 3,
    wait: 100
  };

  let duration = time(function() {
    let val = square(thing);
    do_check_eq(val, 9);
  });
  do_check_true(duration >= 100);
}

// Make sure the exported Sync object/function has Function properties
function test_function_Sync() {
  // We can't check the functions directly because the Function object for Sync
  // and this test script are compiled against different globals. So do the next
  // best thing and check if they look the same: function call() [native code]
  do_check_eq(Sync.call.toSource(), Function.prototype.call.toSource());
  do_check_eq(Sync.apply.toSource(), Function.prototype.apply.toSource());
}
