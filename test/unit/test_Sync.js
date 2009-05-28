Components.utils.import("resource://jsmodules/Sync.js");

function run_test() {
  let startTime = new Date();
  Sync.sleep(1000);
  let endTime = new Date();
  do_check_true(endTime - startTime >= 1000);
}
