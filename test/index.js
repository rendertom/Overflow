(function() {

	// @include '../src/Overflow.js'

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

		Overflow.compact(layer);
		// Overflow.expand(layer);
		// var e = Overflow.exists(layer);
		// alert(e);

		app.endUndoGroup();


	} catch (e) {
		alert(e.toString() + '\nScript File: ' + File.decode(e.fileName).replace(/^.*[\|\/]/, '') +
			'\nFunction: ' + arguments.callee.name +
			'\nError on Line: ' + e.line.toString());
	}

})();