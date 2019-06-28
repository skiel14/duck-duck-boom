var level = 1;
var deltaDegree = 30;
var playQuackSound = true;
var goToDegree = 0;
var saved = 0;
var score = 0;
$("#myScore").html(score);
$("#pond").hide();
$("#footer").hide();
const selected = ".selected";
var chosen = "";
var defaultTimerTime = 60;
var scoreData = [];
var intervalId;
var number = 1;
var hangTime = 1500;
var stopGame = false;

var newLeader;
$("#submitNewLeader").click(function () {
    submitNewLeader();
    $("#newLeaderDiv").toggle();
    $("#leaderBoardLink").click()
});

function submitNewLeader() {
    var newLeaderName = $("#newName").val();
    if (newLeaderName=="") {
        newLeaderName = "Anonymous"
    };
    var newLeaderScore = score;
    newLeader = {
        "score": newLeaderScore,
        "name": newLeaderName
    }
    var scoreRequest = new XMLHttpRequest();
    scoreRequest.onload = getLeadersListener;
    scoreRequest.open('post', '/insertScore');
    scoreRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    scoreRequest.send(JSON.stringify(newLeader));
}

var getLeadersListener = function () {
    $("#leaderBoard").empty();
    scoreData = JSON.parse(this.responseText);

    scoreData.forEach(function (row) {
        appendNewLeader(row);

    })
}

function getScores() {
    var scoreRequest = new XMLHttpRequest();
    scoreRequest.onload = getLeadersListener;
    scoreRequest.open('get', '/getScores');
    scoreRequest.send();
}
getScores();

var appendNewLeader = function (leader) {
    var newRow = $("<tr>");
    newRow.addClass("table-warning");
    var newName = $("<td>");
    newName.text(leader.name);
    var newScore = $("<td>");
    newScore.text(leader.score);
    newRow.append(newName);
    newRow.append(newScore);
    $("#leaderBoard").append(newRow);
}

$('.navbar-nav>li>a').on('click', function () {
    $('.navbar-collapse').collapse('hide');
});
$(function() {
  $(document).click(function (event) {
    $('.navbar-collapse').collapse('hide');
  });
});

// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
function detectmob() {
    if (window.innerWidth <= 800 && window.innerHeight <= 600) {
        return true;
    } else {
        return false;
    }
}

//Rotate Ducks
function rotateDuck(degree, duck) {
    var tempDegree = degree;
    if (typeof duck == "object") {
        duck.setAttribute("degree", tempDegree);
    } else {
        document.querySelector(duck).setAttribute("degree", tempDegree);
    }
    var rotate = anime({
        targets: duck,
        rotate: degree,
        duration: 1500,
        loop: false,
        elasticity: 10,
        easing: 'spring(1, 100, 40, 0)'
    });
}

//Rotate the loaded ducks
function rotateAllDucks() {
    var ducks = $(".duck");
    for (var i = 0; i < ducks.length; i++) {
        goToDegree = (Math.floor(Math.random() * (360 / deltaDegree - 1)) + 1) * deltaDegree + 720;
        goToDegree *= (Math.round(Math.random()) == 0) ? -1 : 1;
        rotateDuck(goToDegree, ducks[i]);
    }
}

//Add Ducks to Grid
function loadDucksX() {
    $("#duckInnerDiv").empty();
    var clientHeight = document.getElementById('duckInnerDiv').clientHeight;
    var size = clientHeight / level;
    var duckMargin = size / 20;

    for (var i = 0; i < level * level; i++) {
        var eImg = document.createElement("img");
        eImg.src = "https://cdn.glitch.com/37802fbb-bed4-4618-9dee-dcaf94eb3c2a%2FRubberDuck.png?v=1561325696437";
        eImg.style.width = `${size}px`;
        eImg.style.maxWidth = `${size}px`;
        eImg.style.padding = `${1 / level}em`;
        eImg.className = "duck unsaved";
        $("#duckInnerDiv").append(eImg);
    }
    rotateAllDucks();
}

function selectDuck() {
    var unsaved = $(".unsaved");
    var randNum = Math.floor(Math.random() * unsaved.length);
    unsaved[randNum].className += " selected";
    unsaved[randNum].parentNode.className += " selectedParent";
}

function loadDucks() {
    $("#duckDiv").empty();

    var maxWidth = Math.min(window.innerWidth, window.innerHeight);
    maxWidth = Math.floor(0.8 * maxWidth);
    var size = maxWidth / level;
    var padding = size * 0.05;
    size -= 3 * padding;

    var duckTable = $("<table>");
    for (var i = 0; i < level; i++) {
        var newRow = $("<tr>");
        for (var j = 0; j < level; j++) {
            var newCell = $("<td>");
            newCell.css("padding", padding + "px");
            var eImg = document.createElement("img");
            eImg.src = "https://cdn.glitch.com/37802fbb-bed4-4618-9dee-dcaf94eb3c2a%2FRubberDuck.png?v=1561325696437";
            eImg.style.width = `${size}px`;
            eImg.style.maxWidth = `${size}px`;
            eImg.style.padding = `${1 / level}em`;
            eImg.className = "duck unsaved";
            newCell.append(eImg);
            newRow.append(newCell);
        }
        duckTable.append(newRow);
    }
    $("#duckDiv").append(duckTable);
    rotateAllDucks();
    selectDuck();
}

$(document).on("click", ".duck", function () {
    chosen = $(this);
    if (!($(this).hasClass("saved"))) {
        var ducks = $(".duck");
        $(".selected").each(function () {
            $(this).removeClass("selected");
            $(this).parent().removeClass("selectedParent");
        });
        $(this).addClass("selected");
        $(this).parent().addClass("selectedParent");
    }
})

$("#goLeft").click(function () {
    var duck = document.querySelector(selected);
    if (!duck) return;
    goToDegree = parseInt(duck.getAttribute("degree"));
    goToDegree -= deltaDegree;
    rotateDuck(goToDegree, selected);
})

$("#goRight").click(function () {
    var duck = document.querySelector(selected);
    if (!duck) return;
    goToDegree = parseInt(duck.getAttribute("degree"));
    goToDegree += deltaDegree;
    rotateDuck(goToDegree, selected);
})

$("#saveMe").click(function () {
    var duck = document.querySelector(selected);
    if (!duck) return;
    goToDegree = parseInt(duck.getAttribute("degree"));
    while (goToDegree < 0) {
        goToDegree += 360;
    }
    if (goToDegree % 360 === 0) {
        chosen = $(".selected");
        //Gray out the duck
        chosen.parent().removeClass("selectedParent");
        chosen.removeClass("selected");
        chosen.removeClass("unsaved");
        chosen.addClass("saved");
        chosen.attr("src", "https://cdn.glitch.com/1d918182-078d-48c3-976a-a7da6dce1b3a%2FQQB.002.png?v=1561411011453");
        chosen = "";
        score += level;
        saved++;
        $("#myScore").html(score);
        if (saved == level * level) {
            saved = 0;
            level++;
            if (level==11) {
                level=1;
            }
            $("#currentLevel").html(level);
            loadDucks();
        } else {
            selectDuck();
        }
    }
})

$("#startGame").click(function () {
    newGame();
})

function timer() {
    number = defaultTimerTime;
    function runTimer() {
        $("#timer").html(number);
        clearInterval(intervalId);
        intervalId = setInterval(decrement, 1000);
    }
    function decrement() {
        if (playQuackSound) {
            playSound("quack");
        }
        number--;
        var paddedNumber = "000" + number;
        paddedNumber = paddedNumber.substr(paddedNumber.length - 2, 2);
        $("#timer").html(paddedNumber);
        if (number === 0 || stopGame) {
            stopGame = true;
            stopTimer();
            $(".offWhenPlaying").removeAttr("disabled");
            destroyAllDucks();
            var allUnsaved = document.querySelectorAll(".unsaved");
        }
    }
    function stopTimer() {
        clearInterval(intervalId);
    }
    runTimer();
}

function checkNewScore() {
    if (score > 0 && ( score > scoreData[scoreData.length - 1].score || scoreData.length < 10)) {
        $("#newLeaderDiv").toggle();
    } else {
        $("#leaderBoardLink").click();
    }
}

function adjustSomeStyles() {
    var verticalPadding = document.getElementById("header").clientHeight + document.getElementById("footer").clientHeight;
    verticalPadding *= 3;
    var c = document.getElementsByClassName("vertically-centered-div");
    for (var i = 0; i < c.length; i++) {
        c[i].style.paddingBottom = `${verticalPadding}px`;
    }
}

if (!detectmob()) {
    alert("Not a mobile browser...");
}

adjustSomeStyles();

function saveAllDucks() {
    rotateDuck(0, ".unsaved");
    var allUnsaved = document.querySelectorAll(".unsaved");
    for (var i = 0; i < allUnsaved.length; i++) {
        allUnsaved[i].setAttribute("degree", 0);
    }
    for (var i = 0; i < allUnsaved.length; i++) {
        setTimeout(function () {
            if (!stopGame) $("#saveMe").click();
        }, 50 * i);
    }
}

function destroyAllDucks() {
  setTimeout(function(){ realDestroyAllDucks(); },2000);
}

function realDestroyAllDucks() {
    var allUnsaved = document.querySelectorAll(".unsaved");
    for (var i = 0; i < allUnsaved.length; i++) {
        setTimeout(function (deadDuck) {
            playSound("boom");
            rotateDuck(0, deadDuck);
            deadDuck.parentNode.className -= " selectedParent";
            deadDuck.setAttribute("src", "https://cdn.glitch.com/1d918182-078d-48c3-976a-a7da6dce1b3a%2FQQB.003.png?v=1561411011012");
        }, hangTime * i, allUnsaved[i]);
    }
    $(".gameButtons").attr("disabled", "");
    $(".cheatButton").attr("disabled", "");
    setTimeout(function() { checkNewScore(); }, hangTime * i);
}

$("#newGameLink").click(function () {
    newGame();
    return false;
});

$("#stopGameLink").click(function () {
    stopGame = true;
    return false;
});

function newGame() {
    qqb();
    level = 1;
    score = 0;
    saved = 0;
    stopGame = false;
    setTimeout(function(){
        $("#currentLevel").html(level);
        $("#myScore").html(score);
        $("#startDiv").hide();
        $("#pond").show();
        $("#footer").show();
        $(".offWhenPlaying").attr("disabled", "");
        $(".gameButtons").removeAttr("disabled");
        $(".cheatButton").removeAttr("disabled");
        checkSAD();
        loadDucks();
        timer();
        $("body").css('background', '#00bff3');
    },3000);
}

function checkSAD() {
    var stringStart = "?sad";
    if (window.location.search.indexOf(stringStart) == 0) {
        $(".gameButtons").hide();
        $(".cheatButton").show();
    } else {
        $(".gameButtons").show();
        $(".cheatButton").hide();
    }
}

$("#saveAll").click(function () {
    saveAllDucks();
});

var oSounds = {
      quack: "https://cdn.glitch.com/546bc980-ef02-4c5d-933a-f08eda59e6d5%2Fquack.mp3?v=1561477548960",
      boom: "https://cdn.glitch.com/546bc980-ef02-4c5d-933a-f08eda59e6d5%2Fboom.mp3?v=1561477576625",
    }
    var loadedSound = "";
    function playSound(soundName) {
      var eAudioSource = document.getElementById("audioSource"),
          eAudioElement = document.getElementById("audioElement");
      eAudioElement.pause();
      eAudioElement.currentTime = 0;
      if (oSounds[soundName]!=loadedSound) {
        eAudioSource.setAttribute("src",oSounds[soundName]);
        eAudioElement.load();
        loadedSound = soundName;
      }
      eAudioElement.play();
    }
    function qqb() {
      var interval = 1000, iSound = 0;
      setTimeout(function(){playSound("quack");},interval*(iSound++));
      setTimeout(function(){playSound("quack");},interval*(iSound++));
      setTimeout(function(){playSound("boom");},interval*(iSound++));
    }