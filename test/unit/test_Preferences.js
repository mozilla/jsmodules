Components.utils.import("resource://jsmodules/Preferences.js");

function test_set_get_pref() {
  Preferences.set("test_set_get_pref.integer", 1);
  do_check_eq(Preferences.get("test_set_get_pref.integer"), 1);

  Preferences.set("test_set_get_pref.string", "foo");
  do_check_eq(Preferences.get("test_set_get_pref.string"), "foo");

  Preferences.set("test_set_get_pref.boolean", true);
  do_check_eq(Preferences.get("test_set_get_pref.boolean"), true);

  // Clean up.
  Preferences.resetBranch("test_set_get_pref.");
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

  // Clean up.
  Preferences.resetBranch("test_set_get_multiple_prefs.");
}

function test_set_get_unicode_pref() {
  Preferences.set("test_set_get_unicode_pref", String.fromCharCode(960));
  do_check_eq(Preferences.get("test_set_get_unicode_pref"), String.fromCharCode(960));

  // Clean up.
  Preferences.reset("test_set_get_unicode_pref");
}

// Make sure that we can get a string pref that we didn't set ourselves
// (i.e. that the way we get a string pref using getComplexValue doesn't
// hork us getting a string pref that wasn't set using setComplexValue).
function test_get_string_pref() {
  let svc = Cc["@mozilla.org/preferences-service;1"].
            getService(Ci.nsIPrefService).
            getBranch("");
  svc.setCharPref("test_get_string_pref", "a normal string");
  do_check_eq(Preferences.get("test_get_string_pref"), "a normal string");

  // Clean up.
  Preferences.reset("test_get_string_pref");
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
