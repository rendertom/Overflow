var ArrayEx = (function() {
	var module = {};

	module.ensureIsArray = function(array) {
		if (!module.isArray(array)) {
			array = [array];
		}

		return array;
	};

	module.isArray = function(array) {
		return Object.prototype.toString.call(array) === '[object Array]';
	};

	return module;
})();