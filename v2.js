(function() {
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

	var ObjectEx = (function() {
		var module = {};

		module.assign = function(target, sources) {
			if (typeof sources === 'undefined') {
				return target;
			}

			sources = ArrayEx.ensureIsArray(sources);

			ArrayEx.forEach(sources, function(source) {
				if (!module.isObject(source)) return;

				module.forOwn(source, function(value, key, object) {
					target[key] = value;
				});
			});

			return target;
		};

		module.forOwn = function(object, callback) {
			for (var key in object) {
				if (object.hasOwnProperty(key)) {
					callback(object[key], key, object);
				}
			}
		};

		module.isObject = function(object) {
			return (typeof object === 'object') && object !== null;
		};

		return module;
	})();

	var Overflow = (function() {
		var defaults = {
			maxStep: 10,
			minStep: 1,
		};

		var module = {};
		var _sourceLayer, _testLayer;

		module.fix = function(textLayer, parameters) {
			if (!(textLayer instanceof TextLayer && TextLayerEx.isBoxText(textLayer))) {
				return textLayer;
			}

			parameters = ObjectEx.assign(defaults, parameters);
			init(textLayer);

			if (hasOverflow()) {
				while (hasOverflow()) {
					incrementFontSize(-parameters.maxStep);
				}

				while (!hasOverflow()) {
					incrementFontSize(parameters.minStep);
				}

				incrementFontSize(-parameters.minStep);
			}

			_testLayer.remove();

			return _sourceLayer;
		};

		return module;

		function hasOverflow() {
			return TextLayerEx.getNumberOfLines(_sourceLayer) < TextLayerEx.getNumberOfLines(_testLayer);
		}

		function incrementFontSize(value) {
			TextLayerEx.incrementFontSize(_sourceLayer, value);
			TextLayerEx.incrementFontSize(_testLayer, value);
		}

		function init(textLayer) {
			_sourceLayer = textLayer;
			_testLayer = textLayer.duplicate();
			TextLayerEx.setTextboxSize(_testLayer, [undefined, 99999]);
		}
	})();

	var TextLayerEx = (function() {
		var module = {};

		module.getBaselineLocks = function(textLayer) {
			var textValue = module.getValue(textLayer);
			return textValue.baselineLocs;
		};

		module.getDocument = function(textLayer) {
			return textLayer.property('ADBE Text Properties').property('ADBE Text Document');
		};

		module.getNumberOfLines = function(textLayer) {
			var baselineLocs = module.getBaselineLocks(textLayer);
			return baselineLocs.length / 4;
		};

		module.getValue = function(textLayer) {
			var textDocument = module.getDocument(textLayer);
			return textDocument.value;
		};

		module.incrementFontSize = function(textLayer, incrementValue) {
			var value = module.getValue(textLayer);
			value.fontSize += incrementValue;
			module.setValue(textLayer, value);

			return value.fontSize;
		};

		module.isBoxText = function(textLayer) {
			var value = module.getValue(textLayer);
			return value.boxText;
		};

		module.setTextboxSize = function(textLayer, size) {
			var value = module.getValue(textLayer);
			var boxTextSize = value.boxTextSize;

			if (typeof size !== 'undefined') {
				size = ArrayEx.ensureIsArray(size);

				boxTextSize[0] = size[0] || boxTextSize[0];
				boxTextSize[1] = size[1] || boxTextSize[1];
			}

			value.boxTextSize = boxTextSize;
			module.setValue(textLayer, value);
		};

		module.setValue = function(textLayer, textValue) {
			var textDocument = module.getDocument(textLayer);
			textDocument.setValue(textValue);
		};

		return module;
	})();

	try {

		var composition = app.project.activeItem;
		if (!composition || !(composition instanceof CompItem)) {
			return alert('Please select composition first');
		}

		var layer = composition.selectedLayers[0];
		if (!layer) {
			return alert('Please select a layer');
		}

		app.beginUndoGroup("undoString");

		Overflow.fix(layer);

		app.endUndoGroup();


	} catch (e) {
		alert(e.toString() + '\nScript File: ' + File.decode(e.fileName).replace(/^.*[\|\/]/, '') +
			'\nFunction: ' + arguments.callee.name +
			'\nError on Line: ' + e.line.toString());
	}

})();