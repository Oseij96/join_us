import express from 'express';
import mysql from 'mysql2/promise'; // promise version for async/await
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 10000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Async IIFE to connect and start server
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: true // required for Aiven
    });

    console.log('✅ Connected to Aiven MySQL!');

    // Routes
    app.get('/', async (req, res) => {
      try {
        const [results] = await connection.execute('SELECT COUNT(*) AS count FROM users');
        const count = results[0].count;
        res.render('home', { data: count });
      } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
      }
    });

    app.post('/register', async (req, res) => {
      const person = { email: req.body.email };
      try {
        await connection.execute('INSERT INTO users SET ?', [person]);
        res.redirect('/');
      } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred during registration.');
      }
    });

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 App listening on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Database connection failed:', err.stack);
  }
})();
