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
			minStep: 1
		};

		var module = {};
		var _sourceLayer, _testLayer;

		module.exists = function(textLayer) {
			if (!isBoxTextLayer(textLayer)) {
				return false;
			}

			return processLayer(textLayer, function() {
				return hasOverflow();
			});
		};

		module.expand = function(textLayer) {
			if (!isBoxTextLayer(textLayer)) {
				return textLayer;
			}

			return processLayer(textLayer, function() {
				var boxTextPos, epsilon, height, lastLineEndY, width;

				if (hasOverflow()) {
					epsilon = 0.01;
					boxTextPos = TextLayerEx.getValueFor(textLayer, 'boxTextPos');
					lastLineEndY = TextLayerEx.getValueFor(textLayer, 'baselineLocs').pop();
					height = toPositive(boxTextPos[1]) + toPositive(lastLineEndY);
					width = TextLayerEx.getValueFor(_testLayer, 'boxTextSize')[0];

					TextLayerEx.setValueFor(textLayer, 'boxTextSize', [width, height + epsilon]);
				}

				return textLayer;
			});
		};

		module.compact = function(textLayer, parameters) {
			if (!isBoxTextLayer(textLayer)) {
				return textLayer;
			}

			parameters = parseParameters(parameters);

			return processLayer(textLayer, function() {
				if (hasOverflow()) {
					while (hasOverflow()) {
						incrementFontSize(-parameters.maxStep);
					}

					while (!hasOverflow()) {
						incrementFontSize(parameters.minStep);
					}

					incrementFontSize(-parameters.minStep);
				}

				return textLayer;
			});
		};

		return module;

		function processLayer(textLayer, callback) {
			var result, boxTextHeight, boxTextSize;

			_sourceLayer = textLayer;
			_testLayer = textLayer.duplicate();
			_testLayer.enabled = false;

			boxTextSize = TextLayerEx.getValueFor(textLayer, 'boxTextSize');
			boxTextHeight = 99999;
			boxTextSize[1] = boxTextHeight;

			TextLayerEx.setValueFor(_testLayer, 'boxTextSize', boxTextSize);

			result = callback();

			_testLayer.remove();

			return result;
		}

		function hasOverflow() {
			var sourceNumLines = TextLayerEx.getNumberOfLines(_sourceLayer);
			var testNumLines = TextLayerEx.getNumberOfLines(_testLayer);

			return sourceNumLines < testNumLines;
		}

		function incrementFontSize(value) {
			var sourceFontSize = TextLayerEx.getValueFor(_sourceLayer, 'fontSize');
			var testFontSize = TextLayerEx.getValueFor(_testLayer, 'fontSize');

			TextLayerEx.setValueFor(_sourceLayer, 'fontSize', sourceFontSize + value);
			TextLayerEx.setValueFor(_testLayer, 'fontSize', testFontSize + value);
		}

		function isBoxTextLayer(textLayer) {
			return TextLayerEx.isTextLayer(textLayer) && TextLayerEx.isBoxText(textLayer);
		}

		function parseParameters(parameters) {
			parameters = ObjectEx.assign(defaults, parameters);
			parameters.maxStep = toPositive(parameters.maxStep);
			parameters.minStep = toPositive(parameters.minStep);

			return parameters;
		}

		function toPositive(value) {
			return value > 0 ? value : -value;
		}
	})();

	var TextLayerEx = (function() {
		var module = {};

		module.getDocument = function(textLayer) {
			return textLayer.property('ADBE Text Properties').property('ADBE Text Document');
		};

		module.getNumberOfLines = function(textLayer) {
			var baselineLocs = module.getValueFor(textLayer, 'baselineLocs');
			return baselineLocs.length / 4;
		};

		module.getValue = function(textLayer) {
			var textDocument = module.getDocument(textLayer);
			return textDocument.value;
		};

		module.getValueFor = function(textLayer, property) {
			var textValue = module.getValue(textLayer);
			return textValue[property];
		};

		module.isBoxText = function(textLayer) {
			return module.getValueFor(textLayer, 'boxText');
		};

		module.isTextLayer = function(textLayer) {
			return textLayer instanceof TextLayer;
		};

		module.setValue = function(textLayer, textValue) {
			var textDocument = module.getDocument(textLayer);
			textDocument.setValue(textValue);
		};

		module.setValueFor = function(textLayer, property, value){
			var textValue = module.getValue(textLayer);
			textValue[property] = value;
			module.setValue(textLayer, textValue);
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

		// Overflow.compact(layer);
		// Overflow.expand(layer);
		var e = Overflow.exists(layer);
		alert(e);

		app.endUndoGroup();


	} catch (e) {
		alert(e.toString() + '\nScript File: ' + File.decode(e.fileName).replace(/^.*[\|\/]/, '') +
			'\nFunction: ' + arguments.callee.name +
			'\nError on Line: ' + e.line.toString());
	}

})();