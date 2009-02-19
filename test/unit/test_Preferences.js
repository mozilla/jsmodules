Components.utils.import("resource://jsmodules/Preferences.js");

// Make sure the module doesn't throw an exception when asked to reset
// a nonexistent pref.
function test_reset_nonexistent_pref() {
  Preferences.reset("nonexistent.pref");
}

// Make sure the module doesn't throw an exception when asked to reset
// a nonexistent pref branch.
function test_reset_nonexistent_pref_branch() {
  Preferences.resetBranch("nonexistent.pref.branch.");
}

function test_reset_pref_branch() {
  Preferences.set("pref.branch.foo", 1);
  Preferences.set("pref.branch.bar", 2);
  do_check_eq(Preferences.get("pref.branch.foo"), 1);
  do_check_eq(Preferences.get("pref.branch.bar"), 2);

  Preferences.resetBranch("pref.branch.");
  do_check_eq(Preferences.get("pref.branch.foo"), undefined);
  do_check_eq(Preferences.get("pref.branch.bar"), undefined);
}
