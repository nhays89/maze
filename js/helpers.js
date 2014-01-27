// Get elements by CSS selector:
function qs(selector, scope) {
	return (scope || document).querySelector(selector);
}
function qsa(selector, scope) {
	return (scope || document).querySelectorAll(selector);
}


// Sudo methods:
var sudo = (function(arr, obj, sudo) {
	[
		['forEach', arr],
		['map', arr],
		['indexOf', arr]
	].forEach(function(method) {
		var fn = method[1][method[0]];
		sudo[method[0]] = function() {
			return fn.call.apply(fn, arguments);
		};
	});
	return sudo;
})([], {}, {});

// sudo.forEach(collection, fn, thisVal);
// sudo.map(collection, fn, thisVal);
// etc.



function createInterval(fn, delay, thisVal /*, argumentToPass1, argumentToPass2, etc. */) {
	var argsToPass = Array.prototype.slice.call(arguments, 3),
		id,
		obj = {
			going: false,
			start: function start() {
				if (this.going) return;
				repeater();
				this.going = true;
			},
			stop: function stop() {
				clearTimeout(id);
				this.going = false;
			}
		};
	function repeater() {
		fn.apply(thisVal, argsToPass);
		id = setTimeout(repeater, delay);
	}
	return obj;
}

// Create an interval:
//
// var frameRefresher = createInterval(refreshFrame, 100, this);
//
//
// Start it:
//
// frameRefresher.start();
//
//
// Stop it:
//
// frameRefresher.stop();