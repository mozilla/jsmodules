Cu.import("resource://jsmodules/Sync.js");

function test_quit_app() {
  // Signal the quit-application notification after half a second
  setTimeout(function() {
    Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService).
      notifyObservers(null, "quit-application", null);
  }, 500);

  try {
    Sync.sleep(100);
  }
  catch(ex) {
    do_throw("Sleep shouldn't have thrown!");
  }

  try {
    Sync.sleep(1000);
    do_throw("Sleep should have failed because we're quitting!");
  }
  catch(ex if ex.result == Cr.NS_ERROR_ABORT) {
    // We're expecting this exception, so let it through
  }
}
