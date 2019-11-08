(function() {

	// @include '../src/Overflow.js'

	try {

		var composition = app.project.activeItem;
		if (!composition || !(composition instanceof CompItem)) {
			return alert('Please select composition first');
		}

		var textLayer = composition.selectedLayers[0];
		if (!textLayer) {
			return alert('Please select a layer');
		}

		app.beginUndoGroup('Fix Overflow');

		// Check whether textLayer contains overflowing text
		Overflow.exists(textLayer);

		// Modify the textbox height to fit the overflowing text
		Overflow.expand(textLayer);

		// Scale font size down until all the text fits inside the textbox
		Overflow.compact(textLayer);

		app.endUndoGroup();


	} catch (e) {
		alert(e.toString() + '\nScript File: ' + File.decode(e.fileName).replace(/^.*[\|\/]/, '') +
			'\nFunction: ' + arguments.callee.name +
			'\nError on Line: ' + e.line.toString());
	}

})();