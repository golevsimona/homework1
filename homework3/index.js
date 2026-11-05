var TOTAL_LAPS = 10;
var LAP_DELAY = 3000;
var PIT_TIME = 22;
var PIT_TIME_SC = 12;

var drivers = [
  { name: "George Russell",   team: "Mercedes", speed: 93, skill: 91 },
  { name: "Kimi Antonelli",   team: "Mercedes", speed: 90, skill: 84 },
  { name: "Charles Leclerc", team: "Ferrari",  speed: 94, skill: 92 },
  { name: "Lewis Hamilton",   team: "Ferrari",  speed: 93, skill: 95 },
  { name: "Max Verstappen",   team: "Red Bull", speed: 98, skill: 97 },
  { name: "Isack Hadjar",     team: "Red Bull", speed: 86, skill: 82 },
  { name: "Lando Norris",     team: "McLaren",  speed: 95, skill: 93 },
  { name: "Oscar Piastri",    team: "McLaren",  speed: 94, skill: 90 },
  { name: "Carlos Sainz",     team: "Williams", speed: 89, skill: 90 },
  { name: "Alexander Albon", team: "Williams", speed: 87, skill: 88 }
];

var lap = 0;
var finished = false;
var timer;

function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var rest = seconds - minutes * 60;
  var text = rest.toFixed(3);
  if (rest < 10) {
    text = "0" + text;
  }
  return minutes + ":" + text;
}

function sortDrivers() {
  drivers.sort(function (a, b) {
    return a.total - b.total;
  });
}

function addLog(message) {
  var logBox = document.getElementById("log");
  logBox.innerHTML = "<li>Lap " + lap + ": " + message + "</li>" + logBox.innerHTML;
}

function setup() {
  for (var i = 0; i < drivers.length; i++) {
    var d = drivers[i];
    d.number = i + 1;
    if (Math.random() < 0.5) {
      d.tyre = "Soft";
    } else {
      d.tyre = "Hard";
    }
    d.startTyre = d.tyre;
    d.tyreAge = 0;
    d.pitLap = Math.floor(3 + Math.random() * 5);
    d.pitted = false;
    d.total = 0;
    d.status = "On the grid";
    d.statusClass = "";
  }

  var rows = "";
  for (var i = 0; i < drivers.length; i++) {
    var d = drivers[i];
    rows += "<tr>" +
      "<td>" + d.number + "</td>" +
      "<td>" + d.name + "</td>" +
      "<td>" + d.team + "</td>" +
      "<td>" + d.speed + "</td>" +
      "<td>" + d.skill + "</td>" +
      "<td class='" + d.startTyre.toLowerCase() + "'>" + d.startTyre + "</td>" +
      "</tr>";
  }
  document.querySelector("#driversTable tbody").innerHTML = rows;

  document.getElementById("lapInfo").textContent = "Lap 0 / " + TOTAL_LAPS;
  showTable("startTable", "startTitle", "Status at start of lap 1", false);
}

function showTable(tableId, titleId, title, showWinner) {
  sortDrivers();
  document.getElementById(titleId).textContent = title;

  var html = "<thead><tr><th>Pos.</th><th>Driver</th><th>Team</th><th>Tyres</th>" +
             "<th>Total time</th><th>Gap</th><th>Status</th></tr></thead><tbody>";

  for (var i = 0; i < drivers.length; i++) {
    var d = drivers[i];

    var rowClass = "";
    var name = d.name;
    if (showWinner && i === 0) {
      rowClass = "winner";
      name = name + " 🏆";
    }

    var time = "-";
    var gap = "-";
    if (lap > 0) {
      time = formatTime(d.total);
      if (i > 0) {
        gap = "+" + (d.total - drivers[0].total).toFixed(3);
      }
    }

    html += "<tr class='" + rowClass + "'>" +
      "<td>" + (i + 1) + "</td>" +
      "<td>" + name + "</td>" +
      "<td>" + d.team + "</td>" +
      "<td class='" + d.tyre.toLowerCase() + "'>" + d.tyre + "</td>" +
      "<td>" + time + "</td>" +
      "<td>" + gap + "</td>" +
      "<td class='" + d.statusClass + "'>" + d.status + "</td>" +
      "</tr>";
  }
  html += "</tbody>";
  document.getElementById(tableId).innerHTML = html;
}

function nextLap() {
  if (finished) {
    return;
  }

  showTable("startTable", "startTitle", "Status at start of lap " + (lap + 1), false);
  lap++;

  var safetyCar = false;
  if (lap > 1 && lap < TOTAL_LAPS && Math.random() < 0.15) {
    safetyCar = true;
  }

  var banner = document.getElementById("banner");
  if (safetyCar) {
    banner.textContent = "🚨 Safety car on track!";
    addLog("Safety car deployed - everyone slows down.");
  } else {
    banner.textContent = "";
  }

  for (var i = 0; i < drivers.length; i++) {
    var d = drivers[i];

    if (safetyCar) {
      d.status = "Safety car";
      d.statusClass = "st-sc";
    } else {
      d.status = "Racing";
      d.statusClass = "";
    }

    var lapTime = 95 - d.speed * 0.1 - d.skill * 0.05;

    if (d.tyre === "Soft") {
      lapTime = lapTime - 1 + d.tyreAge * 0.3;
    } else {
      lapTime = lapTime + d.tyreAge * 0.1;
    }

    lapTime = lapTime + Math.random() * 2;

    if (safetyCar) {
      lapTime = lapTime + 20;
    } else {
      var chance = Math.random();
      if (chance < 0.05) {
        lapTime = lapTime + 8;
        d.status = "Spun";
        d.statusClass = "st-spin";
        addLog(d.name + " spun.");
      } else if (chance < 0.08) {
        lapTime = lapTime + 12;
        d.status = "Went off track";
        d.statusClass = "st-off";
        addLog(d.name + " went off the track.");
      }
    }

    if (d.pitted === false && (lap === d.pitLap || lap === TOTAL_LAPS - 1)) {
      var oldTyre = d.tyre;
      if (oldTyre === "Soft") {
        d.tyre = "Hard";
      } else {
        d.tyre = "Soft";
      }
      d.tyreAge = 0;
      d.pitted = true;

      if (safetyCar) {
        lapTime = lapTime + PIT_TIME_SC;
      } else {
        lapTime = lapTime + PIT_TIME;
      }
      d.status = "In the pits";
      d.statusClass = "st-pit";
      addLog(d.name + " pits (" + oldTyre + " -> " + d.tyre + ").");
    } else {
      d.tyreAge++;
    }

    d.total = d.total + lapTime;
  }

  if (lap === TOTAL_LAPS) {
    finished = true;
    clearInterval(timer);
    showTable("endTable", "endTitle", "Status at end of lap " + lap + " - FINAL", true);
    banner.textContent = "🏆 Winner: " + drivers[0].name + " (" + drivers[0].team + ")!";
    addLog("Race finished. Winner: " + drivers[0].name + ".");
    document.getElementById("lapInfo").textContent = "Race finished (" + TOTAL_LAPS + "/" + TOTAL_LAPS + ")";
    return;
  }

  document.getElementById("lapInfo").textContent = "Lap " + lap + " / " + TOTAL_LAPS;
  showTable("endTable", "endTitle", "Status at end of lap " + lap, false);
}

setup();
timer = setInterval(nextLap, LAP_DELAY);
