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
				row.append("<th>" + train.name + "</th>");
				row.append("<th>" + train.destination + "</th>");
				row.append("<th>" + train.frequency + "</th>");
			};
			function populateNextArrivalsColumns(train, row) {
				var firstDepMinutes = parseMilitaryTime(train.first);
				var frequency = train.frequency;
				var currentMinutes = getCurrentTimeInMinutes();
				var timeDifference = currentMinutes - firstDepMinutes;
				if (timeDifference >= 0) {
					var multiplier = Math.ceil(timeDifference / parseInt(train.frequency));
					var nextDeparture = (multiplier * frequency) + firstDepMinutes;
					console.log(currentMinutes);
					console.log(nextDeparture);
					row.append("<th>" + stringifyTime(nextDeparture) + "</th>");
					var depMinFromNow = nextDeparture - currentMinutes;
					row.append("<th>" + depMinFromNow + "</th>");
				} else {
					row.append("<th>" + stringifyTime(firstDepMinutes) + "</th>");
					var depMinFromNow = firstDepMinutes - currentMinutes;
					row.append("<th>" + depMinFromNow + "</th>");				}
			};
			this.allTrains.forEach(function(train) {
				console.log(train);
				var newRow = $("<tr></tr>");
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

	function getCurrentTimeInMinutes() {
		var currentTime = new Date($.now());
		return (currentTime.getHours() * 60) + currentTime.getMinutes();
	};

	function parseMilitaryTime(t) {
		var tSplit = t.split(":");
		return (parseInt(tSplit[0]) * 60) + parseInt(tSplit[1]);
	};

	function stringifyTime(minutes) {
		var hours = Math.floor(minutes / 60);
		var hours = hours % 24;
		var minutesLeft = minutes % 60;
		var stringifiedTime = hours + ":" + minutesLeft;
		if (stringifiedTime.length < 5) {
			return stringifiedTime + "0";
		}
		return stringifiedTime;
	};

	database.ref().on("value", function(snapshot) {
		console.log("Data has been updated");
		if (snapshot.child("trains").exists() && snapshot.val().trains.length == 0) {
			trainApp.allTrains = [];
		} else if (snapshot.child("trains").exists()) {
			trainApp.allTrains = snapshot.val().trains;
		} else {
			trainApp.allTrans = [];
		}
		trainApp.start();
	});

	$("#main-form").on("submit", function(event) {
		console.log(event);
		event.preventDefault();
		var newTrainLine = {
			name: $("#name-input").val(),
			destination: $("#dest-input").val(),
			first: $("#time-input").val(),
			frequency: parseInt($("#freq-input").val()),
		};
		trainApp.allTrains.push(newTrainLine);
		database.ref().set({
			trains: trainApp.allTrains,
		});
	});

	setInterval(trainApp.start, 60000);
});