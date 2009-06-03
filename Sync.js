/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Weave.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Edward Lee <edilee@mozilla.com>
 *   Dan Mills <thunder@mozilla.com>
 *   Myk Melez <myk@mozilla.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

let EXPORTED_SYMBOLS = ["Sync"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

/**
 * Make a synchronous version of the function object that will be called with
 * the provided thisArg.
 *
 * @param func {Function}
 *        The asynchronous function to make a synchronous function
 * @param thisArg {Object} [optional]
 *        The object that the function accesses with "this"
 * @usage let ret = Sync(asyncFunc, obj)(arg1, arg2);
 * @usage let ret = Sync(ignoreThisFunc)(arg1, arg2);
 * @usage let sync = Sync(async); let ret = sync(arg1, arg2);
 */
function Sync(func, thisArg) {
  // Hold the value passed in from the callback to return
  let retval;

  // Track if the onComplete has been called
  let gotComplete = false;
  let onComplete = function(data) {
    retval = data;
    gotComplete = true;
  };

  // Determine if the custom callback should be passed in as the first arg
  let insertCallback = true;

  let syncFunc = function(/* arg1, arg2, ... */) {
    // Grab the current thread so we can make it give up priority
    let thread = Cc["@mozilla.org/thread-manager;1"].getService().currentThread;

    // Save the original arguments into an array
    let args = Array.slice(arguments);

    // Inject our custom callback as the first argument for the async function
    if (insertCallback)
      args.unshift(onComplete);

    // Call the async function bound to thisArg with the passed args
    func.apply(thisArg, args);

    // Keep waiting until our callback is triggered
    while (!gotComplete)
      thread.processNextEvent(true);

    // Return the value passed to the callback
    return retval;
  };

  // Grabbing the onComplete converts the sync. function to not assume the first
  // argument is our custom callback
  syncFunc.__defineGetter__("onComplete", function() {
    insertCallback = false;
    return onComplete;
  });

  return syncFunc;
}

/**
 * Set a timer, simulating the API for the window.setTimeout call.
 * This only simulates the API for the version of the call that accepts
 * a function as its first argument and no additional parameters,
 * and it doesn't return the timeout ID.
 *
 * @param func {Function}
 *        the function to call after the delay
 * @param delay {Number}
 *        the number of milliseconds to wait
 */
function setTimeout(func, delay) {
  let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  let callback = {
    _func: func,
    notify: function(timer) {
      // Call the function such that "this" inside the function is the global
      // object, just as it would be with window.setTimeout.
      (this._func)();
    }
  }
  timer.initWithCallback(callback, delay, Ci.nsITimer.TYPE_ONE_SHOT);
}

function sleep(callback, milliseconds) {
  setTimeout(callback, milliseconds);
}

/**
 * Sleep the specified number of milliseconds, pausing execution of the caller
 * without halting the current thread.
 * For example, the following code pauses 1000ms between dumps:
 *
 *   dump("Wait for it...\n");
 *   Sync.sleep(1000);
 *   dump("Wait for it...\n");
 *   Sync.sleep(1000);
 *   dump("What are you waiting for?!\n");
 *
 * @param milliseconds {Number}
 *        The number of milliseconds to sleep
 */
Sync.sleep = Sync(sleep);
