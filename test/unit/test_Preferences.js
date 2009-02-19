Components.utils.import("resource://jsmodules/Preferences.js");

// Make sure the module doesn't throw an exception when asked to reset
// a nonexistent pref.
function test_reset_nonexistent_pref() {
  Preferences.reset("nonexistent.pref");
}
