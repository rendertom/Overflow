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