// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function () {
    if (!exists) {
        db.run('CREATE TABLE Scores (score INTEGER, name TEXT)');
        console.log('New table Scores created!');

        // insert default dreams
        db.serialize(function () {
            db.run('INSERT INTO Scores (score, name) VALUES (255, "Duck Master"), (50, "Average Joe"), (20, "Anonymous")');
        });
    }
    else {
        console.log('Database "Scores" ready to go!');
        db.each('SELECT * from Scores', function (err, row) {
            if (row) {
                console.log(JSON.stringify(row));
            }
        });
    }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getScores', function (request, response) {
    db.all('SELECT * from Scores order by score desc, name asc limit 10', function (err, rows) {
        response.send(JSON.stringify(rows));
    });
});

app.post('/insertScore', function (request, response) {
    var name = request.body.name;
    var score = request.body.score;
    console.log(`${JSON.stringify(request.body)}\n"${name}", ${score}`);
    if (/^[\w -_]+$/i.test(name)) {
        db.serialize(function () {
            db.run(`INSERT INTO Scores (name, score) VALUES ($name, $score)`, { $name: name, $score: score });
            db.all('SELECT * from Scores order by score desc, name asc limit 10;', function (err, rows) {
                response.send(JSON.stringify(rows));
                console.log(JSON.stringify(rows));
            });
        });
    } else {
        response.send("BAD DATA");
    }
});

app.get('/deleteScores', function (request, response) {
    db.run('DELETE from Scores');
    db.all('SELECT * from Scores', function (err, rows) {
        response.send(JSON.stringify(rows));
    });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
