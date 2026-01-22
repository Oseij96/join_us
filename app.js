const express = require('express');
const app = express();

const PORT = process.env.PORT || 10000;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mysql = require('mysql2');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,    
  user: process.env.DB_USER,       
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME                     
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
        return;
    }
    console.log('✅ Connected to MySQL database.');
});

app.get('/', function (req, res) {
    var q = "SELECT COUNT(*) AS count FROM users";
    connection.query(q, function (err, results) {
        if (err) throw err;
        var count = results[0].count;
        // res.send(`Welcome to our homepage. Join us, there are ${count} users and counting!`);
        res.render('home', { data: count });
    });
    // res.send('YOU HAVE REACHED THE HOME PAGE!');
});

app.post('/register', function (req, res) {
    const person = { email: req.body.email };
    connection.query('INSERT INTO users SET ?', person, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Error occurred during registration.");
            return;
        }
        res.redirect("/");
    });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 App listening on port ${PORT}`);
});
