Components.utils.import("resource://jsmodules/Mixins.js");

let source = {
  property: 1,
  property_that_exists_in_target: 2,
  method: function() {},
  get getter() {},
  set setter() {}
};

let target = {
  property_that_exists_in_target: 3
};

function run_test() {
  Mixins.mix(source).into(target);
  do_check_eq(target.property, source.property);
  do_check_eq(target.property_that_exists_in_target, 3);
  do_check_eq(target.method, source.method);
  do_check_eq(target.__lookupGetter__("getter"),
              source.__lookupGetter__("getter"));
  do_check_eq(target.__lookupSetter__("setter"),
              source.__lookupSetter__("setter"));
}
