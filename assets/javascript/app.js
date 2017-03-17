$(document).ready(function() {

	var config = {
		apiKey: "AIzaSyDaDE1z1AXYQTl2Uctj-a4pkxlQxB17Epc",
		authDomain: "choo-choo-mother-fucker.firebaseapp.com",
		databaseURL: "https://choo-choo-mother-fucker.firebaseio.com",
		storageBucket: "choo-choo-mother-fucker.appspot.com",
		messagingSenderId: "1059256690977"
	};

	var refreshDepartures;

	firebase.initializeApp(config);

	var database = firebase.database();

	var trainApp = {
		allTrains: [],

		start: function() {
			console.log("Populating...");
			if (trainApp.allTrains.length) {
				trainApp._populateTable();
			} else {
				trainApp._displayNoTrainsNotice();
			}
		},

		_populateTable: function() {
			this._clearTable();
			// populate name, destination, frequency in table
			function populateFirstThreeColumns(train, row) {
				row.append("<th><button type='button' class='btn btn-default btn-sm rm-row'><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button><button type='button' class='btn btn-default btn-sm edit-row'><span class='glyphicon glyphicon-edit' aria-hidden='true'></span></button></th>")
				row.append("<th>" + train.name + "</th>");
				row.append("<th>" + train.destination + "</th>");
				row.append("<th>" + train.frequency + "</th>");
			};
			// calculate time to arrival and populate table with result
			function populateNextArrivalsColumns(train, row) {
				console.log(train.first);
    			var timeDifference = moment().diff(moment(train.first), "minutes");
    			var frequency = parseInt(train.frequency);
    			if (timeDifference >= 0) {
    				var multiplier = Math.ceil(timeDifference / frequency);
    				var nextDeparture = moment(train.first).add(multiplier * frequency, "minutes");
    				row.append("<th>" + nextDeparture.format("HH:mm") + "</th>");
    				var depMinFromNow = moment(nextDeparture).diff(moment(), "minutes");
					row.append("<th>" + depMinFromNow + "</th>");
    			} else {
    				row.append("<th>" + moment(train.first).format("HH:mm") + "</th>");
					var depMinFromNow = moment(train.first).diff(moment(), "minutes");
					row.append("<th>" + depMinFromNow + "</th>");
    			}
			};
			// loop through all trains in database and assign a row to each
			this.allTrains.forEach(function(train) {
				console.log(train);
				var newRow = $("<tr id='" + train.idKey + "'class='active'></tr>");
				populateFirstThreeColumns(train, newRow);
				populateNextArrivalsColumns(train, newRow);
				$("#train-schedule").children("tbody").append(newRow);
			});
		},

		_displayNoTrainsNotice: function() {
			// always clear table first
			this._clearTable();
			// if no trains in databse, display placeholder notice
			$("#train-schedule").first().append("<tr><th colspan='6' class='text-center'>" + 
										"<strong>No contents</strong></th></tr>");
		},

		_clearTable: function() {
			$("#train-schedule").children().children().slice(1).remove();
		},

		_editRow: function() {
			var row = $(this).parent().parent();
			// reassign click listener on button
			$(this).removeClass("edit-row");
			$(this).addClass("save-row");
			// swap out glyphicon
			$(this).children("span").removeClass("glyphicon-edit");
			$(this).children("span").addClass("glyphicon-floppy-disk");
			// allow for editing of first three columns
			row.children("th").slice(1, 4).attr("contenteditable", "true");
			clearInterval(refreshDepartures); // prevent refresh while editing
			console.log("entering edit mode");
		},

		_saveChanges: function() {
			var row = $(this).parent().parent();
			// reassign click listener on button
			$(this).removeClass("save-row");
			$(this).addClass("edit-row");
			// swap out glyphicon
			$(this).children("span").removeClass("glyphicon-floppy-disk");
			$(this).children("span").addClass("glyphicon-edit");
			var rowId = row.attr("id");
			// update train with corresponding id with new parameters
			database.ref("trains").child(rowId).update({
				name: row.children("th").eq(1).text(),
				destination: row.children("th").eq(2).text(),
				frequency: row.children("th").eq(3).text(),
			});
			// prevent further editing of table cells
			row.children("th").slice(1, 4).attr("contenteditable", "false");
			refreshDepartures = setInterval(trainApp.start, 60000); // restart timer
			console.log("Saving changes");
		},
	};

	database.ref().on("value", function(snapshot) {
		console.log("Data has been updated");
		trainApp.allTrains = [];
		if (snapshot.child("trains").exists()) {
			snapshot.child("trains").forEach(function (train) {
				trainApp.allTrains.push(train.val());
			});
		};
		trainApp.start();
	});

	$("#main-form").on("submit", function(event) {
		console.log(event);
		event.preventDefault();
		var trainLineObj = database.ref("trains").push();
		// reset 
		trainLineObj.set({
			idKey: trainLineObj.key,
			name: $("#name-input").val(),
			destination: $("#dest-input").val(),
			first: moment().format("YYYY-MM-DD") + " " + $("#time-input").val(),
			frequency: parseInt($("#freq-input").val()),
		});
	});

	$("#train-schedule").on("click", ".rm-row", function() {
		var rowId = $(this).parent().parent().attr("id");
		database.ref("trains").child(rowId).remove();
	});

	$("#train-schedule").on("click", ".edit-row", trainApp._editRow);

	$("#train-schedule").on("click", ".save-row", trainApp._saveChanges);

	refreshDepartures = setInterval(trainApp.start, 60000);
});