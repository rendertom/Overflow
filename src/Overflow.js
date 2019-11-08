var Overflow = (function() {
	// @include 'lib/ArrayEx.js'
	// @include 'lib/ObjectEx.js'
	// @include 'lib/TextLayerEx.js'

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

	module.expand = function(textLayer, parameters) {
		if (!isBoxTextLayer(textLayer)) {
			return textLayer;
		}

		parameters = parseParameters(parameters);

		return processLayer(textLayer, function() {
			var boxTextPos, epsilon, height, lastLineEndY, width;

			if (hasOverflow()) {
				while (hasOverflow()) {
					incrementBoxHeight(parameters.maxStep);
				}

				if (parameters.minStep) {
					while (!hasOverflow()) {
						incrementBoxHeight(-parameters.minStep);
					}

					incrementBoxHeight(parameters.minStep);
				}
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

				if (parameters.minStep) {
					while (!hasOverflow()) {
						incrementFontSize(parameters.minStep);
					}

					incrementFontSize(-parameters.minStep);
				}
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

	function incrementBoxHeight(value) {
		var sourceBoxSize = TextLayerEx.getValueFor(_sourceLayer, 'boxTextSize');
		TextLayerEx.setValueFor(_sourceLayer, 'boxTextSize', [sourceBoxSize[0], sourceBoxSize[1] + value]);
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