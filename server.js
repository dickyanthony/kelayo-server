import e from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';

import userRouter from './routes/users.js';
import touristDestinationRouter from './routes/touristDestination.js';
import lodgingReservationRouter from './routes/lodgingReservation.js';

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

app.use(
  '/lodging-reservation',
  (req, res, next) => {
    req.db = db;
    next();
  },
  lodgingReservationRouter
);

app.use(
  '/tourist-destination',
  (req, res, next) => {
    req.db = db;
    next();
  },
  touristDestinationRouter
);

function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

app.listen(3000);
