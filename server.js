import e from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import userRouter from './routes/users.js';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'destination',
});

db.connect((err) => {
  if (err) {
    throw err;
  }

  console.log('MySQL connected...');
});

const app = e();

app.use(logger);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { text: 'testing' });
});

//USER ROUTER

app.use(
  '/users',
  (req, res, next) => {
    req.db = db;
    next();
  },
  userRouter
);

function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

app.listen(3000);
