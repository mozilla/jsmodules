Components.utils.import("resource://jsmodules/Sync.js");

Function.prototype.sync = Sync.sync;

// Test the built-in Sync.sleep method.
function test_Sync_sleep() {
  let startTime = new Date();
  Sync.sleep(100);
  let endTime = new Date();
  do_check_true(endTime - startTime >= 100);
}

function test_Function_prototype_sync() {
  // Test using the Sync.sync method that was added to the Function prototype
  // to define our own sleep method.

  function sleep(callback, milliseconds) {
    setTimeout(callback, milliseconds);
  }

  let startTime = new Date();
  sleep.sync(100);
  let endTime = new Date();
  do_check_true(endTime - startTime >= 100);
}
