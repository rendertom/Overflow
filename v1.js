(function() {
	var Alphabet = (function() {
		var module = {};

		module.build = function(textLayer) {
			var characterWidth, data, textboxLayer;

			textboxLayer = textLayer.duplicate();
			data = ArrayEx.reduce(TextLayerEx.getText(textboxLayer), function(accum, character) {
				if (!accum.hasOwnProperty(character)) {
					TextLayerEx.setText(textboxLayer, character);
					characterWidth = TextLayerEx.getBaselineWidth(textboxLayer);
					accum[character] = characterWidth;
				}

				return accum;
			}, {});

			textboxLayer.remove();

			return data;
		};

		return module;
	})();

	var ArrayEx = (function() {
		var module = {};

		module.reduce = function(array, callback, accumulator) {
			for (var i = 0, il = array.length; i < il; i++) {
				accumulator = callback(accumulator, array[i], i, array);
			}

			return accumulator;
		};

		return module;
	})();

	var TextLayerEx = (function() {
		var module = {};

		module.getBaselineWidth = function(textLayer) {
			var baselineLocs = module.getBaselineLocks(textLayer);
			
			return baselineLocs[2] - baselineLocs[0];
		};

		module.getBaselineWidths = function(textLayer) {
			return ArrayEx.reduce(module.getBaselineLocks(textLayer), function(accum, loc, i, array) {
				// Every 4th element
				if (i % 4 === 0) {
					accum.push(array[i + 2] - array[i]);
				}

				return accum;
			}, []);
		};

		module.getText = function(textLayer) {
			var textValue = module.getValue(textLayer);
			return textValue.text;
		};

		module.getBaselineLocks = function(textLayer) {
			var textValue = module.getValue(textLayer);
			return textValue.baselineLocs;
		};

		module.getValue = function(textLayer) {
			var textDocument = module.getDocument(textLayer);
			return textDocument.value;
		};

		module.getDocument = function(textLayer) {
			return textLayer.property('ADBE Text Properties').property('ADBE Text Document');
		};

		module.setText = function(textLayer, string) {
			var textDocument, textValue;

			textValue = module.getValue(textLayer);
			textValue.text = string;

			textDocument = module.getDocument(textLayer);
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

		var overset = getOversetText(layer);
		alert(overset);

		app.endUndoGroup();


	} catch (e) {
		alert(e.toString() + '\nScript File: ' + File.decode(e.fileName).replace(/^.*[\|\/]/, '') +
			'\nFunction: ' + arguments.callee.name +
			'\nError on Line: ' + e.line.toString());
	}

	function getOversetText(textLayer) {
		var alphabet, lineWidths, characterWidthSum, lineIndex;

		alphabet = Alphabet.build(textLayer);
		lineWidths = TextLayerEx.getBaselineWidths(textLayer);

		characterWidthSum = 0;
		lineIndex = 0;

		return ArrayEx.reduce(TextLayerEx.getText(textLayer), function(accum, character, i, array) {
			var lineWidth = lineWidths[lineIndex];
			if (lineWidth) {
				characterWidthSum += alphabet[character];
				if (shouldStartNewLine(
						lineWidth,
						character,
						characterWidthSum,
						array[i + 1])) {
					characterWidthSum = 0;
					lineIndex++;
				}
			} else {
				accum += character;
			}

			return accum;
		}, '');

		function shouldStartNewLine(lineWidth, character, characterWidthSum, nextCharacter) {
			var isLineBrakeKey, lineTooLong, nextCharacterIsSpace;

			isLineBrakeKey = /\n|\r/.test(character);
			lineTooLong = characterWidthSum > lineWidth;
			nextCharacterIsSpace = /\s/.test(nextCharacter);

			return isLineBrakeKey || (lineTooLong && !nextCharacterIsSpace);
		}
	}
})();