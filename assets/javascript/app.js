$(document).ready(function() {

	var config = {
		apiKey: "AIzaSyDaDE1z1AXYQTl2Uctj-a4pkxlQxB17Epc",
		authDomain: "choo-choo-mother-fucker.firebaseapp.com",
		databaseURL: "https://choo-choo-mother-fucker.firebaseio.com",
		storageBucket: "choo-choo-mother-fucker.appspot.com",
		messagingSenderId: "1059256690977"
	};

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
			function populateFirstThreeColumns(train, row) {
				row.append("<th><button type='button' class='btn btn-default btn-sm rm-row'><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button> " + train.name + "</th>");
				row.append("<th>" + train.destination + "</th>");
				row.append("<th>" + train.frequency + "</th>");
			};
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
			this.allTrains.forEach(function(train) {
				console.log(train);
				var newRow = $("<tr id='" + train.idKey + "'class='active'></tr>");
				populateFirstThreeColumns(train, newRow);
				populateNextArrivalsColumns(train, newRow);
				$("#train-schedule").children("tbody").append(newRow);
			});
		},

		_displayNoTrainsNotice: function() {
			this._clearTable();
			$("#train-schedule").first().append("<tr><th colspan='5' class='text-center'>" + 
										"<strong>No contents</strong></th></tr>");
		},

		_clearTable: function() {
			$("#train-schedule").children().children().slice(1).remove();
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
		var newTrainLine = {
			idKey: trainLineObj.key,
			name: $("#name-input").val(),
			destination: $("#dest-input").val(),
			first: moment().format("YYYY-MM-DD") + " " + $("#time-input").val(),
			frequency: parseInt($("#freq-input").val()),
		};
		trainApp.allTrains.push(newTrainLine);
		trainLineObj.set({
			idKey: trainLineObj.key,
			name: $("#name-input").val(),
			destination: $("#dest-input").val(),
			first: moment().format("YYYY-MM-DD") + " " + $("#time-input").val(),
			frequency: parseInt($("#freq-input").val()),
		});
	});

	$("#train-schedule").on("click", ".rm-row", function() {
		console.log("This button works");
		var rowId = $(this).parent().parent().attr("id");
		database.ref("trains").child(rowId).remove();
	});

	setInterval(trainApp.start, 60000);
});