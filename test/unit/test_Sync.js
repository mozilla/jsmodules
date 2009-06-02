Components.utils.import("resource://jsmodules/Sync.js");
Sync(Function);

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

// Check that the Function.prototype version of sync works
function test_Function_prototype_sync() {
  let duration = time(function() {
    let sum = slowAdd.sync(100, 1, 10);
    do_check_eq(sum, 11);
  });
  do_check_true(duration >= 100);
}

// Check that the non-Function.prototype version of sync works
function test_Sync_sync() {
  let duration = time(function() {
    let sum = Sync.sync(slowAdd)(100, -123, 123);
    do_check_eq(sum, 0);
  });
  do_check_true(duration >= 100);
}

// Check that the non-Function.prototype version of syncBind works
function test_Sync_sync_bind() {
  let duration = time(function() {
    let val = Sync.sync(slowThisGet, { foo: "bar" })(100, "foo");
    do_check_eq(val, "bar");
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
