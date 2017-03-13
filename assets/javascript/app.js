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
			if (this.allTrains.length) {
				this._populateTable();
			} else {
				this._displayNoTrainsNotice();
			}
		},

		_populateTable: function() {
			this._clearTable();
			this.allTrains.forEach(function(train) {
				console.log(train);
				var newRow = $("<tr></tr>");
				newRow.append("<th>" + train.name + "</th>");
				newRow.append("<th>" + train.destination + "</th>");
				newRow.append("<th>" + train.frequency + "</th>");
				var firstDepMinutes = parseMilitaryTime(train.first);
				var currentTime = new Date($.now());
				var currentMinutes = (currentTime.getHours() * 60) + currentTime.getMinutes();
				var timeDifference = currentMinutes - firstDepMinutes;
				if (timeDifference >= 0) {
					var fact = Math.ceil(timeDifference / parseInt(train.frequency));
					var nextDeparture = (fact * parseInt(train.frequency)) + firstDepMinutes;
					console.log(currentMinutes);
					console.log(nextDeparture);
					newRow.append("<th>" + stringifyTime(nextDeparture));
				} else {

				}
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

	function parseMilitaryTime(t) {
		var tSplit = t.split(":");
		return (parseInt(tSplit[0]) * 60) + parseInt(tSplit[1]);
	};

	function stringifyTime(minutes) {
		var hours = Math.floor(t / 60);
		var minutes = t % 60;
		return hours + ":" + minutes;
	}

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
			frequency: $("#freq-input").val(),
		};
		trainApp.allTrains.push(newTrainLine);
		database.ref().set({
			trains: trainApp.allTrains,
		});
	});
});