Components.utils.import("resource://jsmodules/Sync.js");
Sync(Function);

// Helper function to check how long a function takes to run
function time(func) {
  let startTime = new Date();
  func();
  return new Date() - startTime;
}

// Test the built-in Sync.sleep method.
function test_Sync_sleep() {
  let duration = time(function() {
    Sync.sleep(100);
  });
  do_check_true(duration >= 100);
}

function test_Function_prototype_sync() {
  // Test using the Sync.sync method that was added to the Function prototype
  // to define our own sleep method.

  function sleep(callback, milliseconds) {
    setTimeout(callback, milliseconds);
  }

  let duration = time(function() {
    sleep.sync(100);
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
