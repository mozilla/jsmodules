Components.utils.import("resource://jsmodules/Preferences.js");

function run_test() {
  // Run tests manually ourselves instead of letting the harness enumerate
  // and run them so we can reset them all afterwards so they don't persist
  // in the test profile and affect future test runs.
  
  // XXX Does this cause other prefs to get reset that should persist?

  test_set_get_pref();
  test_set_get_multiple_prefs();
  test_reset_pref();
  test_reset_pref_branch();
  test_reset_nonexistent_pref();
  test_reset_nonexistent_pref_branch();

  Preferences.resetBranch("");
}

function test_set_get_pref() {
  Preferences.set("test_set_get_pref.integer", 1);
  do_check_eq(Preferences.get("test_set_get_pref.integer"), 1);

  Preferences.set("test_set_get_pref.string", "foo");
  do_check_eq(Preferences.get("test_set_get_pref.string"), "foo");

  Preferences.set("test_set_get_pref.boolean", true);
  do_check_eq(Preferences.get("test_set_get_pref.boolean"), true);
}

function test_set_get_multiple_prefs() {
  Preferences.set({ "test_set_get_multiple_prefs.integer":  1,
                    "test_set_get_multiple_prefs.string":   "foo",
                    "test_set_get_multiple_prefs.boolean":  true });

  let [i, s, b] = Preferences.get(["test_set_get_multiple_prefs.integer",
                                   "test_set_get_multiple_prefs.string",
                                   "test_set_get_multiple_prefs.boolean"]);

  do_check_eq(i, 1);
  do_check_eq(s, "foo");
  do_check_eq(b, true);
}

function test_reset_pref() {
  Preferences.set("test_reset_pref", 1);
  Preferences.reset("test_reset_pref");
  do_check_eq(Preferences.get("test_reset_pref"), undefined);
}

function test_reset_pref_branch() {
  Preferences.set("test_reset_pref_branch.foo", 1);
  Preferences.set("test_reset_pref_branch.bar", 2);
  Preferences.resetBranch("test_reset_pref_branch.");
  do_check_eq(Preferences.get("test_reset_pref_branch.foo"), undefined);
  do_check_eq(Preferences.get("test_reset_pref_branch.bar"), undefined);
}

// Make sure the module doesn't throw an exception when asked to reset
// a nonexistent pref.
function test_reset_nonexistent_pref() {
  Preferences.reset("test_reset_nonexistent_pref");
}

// Make sure the module doesn't throw an exception when asked to reset
// a nonexistent pref branch.
function test_reset_nonexistent_pref_branch() {
  Preferences.resetBranch("test_reset_nonexistent_pref_branch.");
}
