var ArrayEx = (function() {
	var module = {};

	module.ensureIsArray = function(array) {
		if (!module.isArray(array)) {
			array = [array];
		}

		return array;
	};

	module.forEach = function(array, callback) {
		for (var i = 0, il = array.length; i < il; i++) {
			callback(array[i], i, array);
		}
	};

	module.isArray = function(array) {
		return Object.prototype.toString.call(array) === '[object Array]';
	};

	return module;
})();