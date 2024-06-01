import 'dotenv/config';
import e from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import touristDestinationRouter from './routes/touristDestination.js';
import lodgingReservationRouter from './routes/lodgingReservation.js';
import tourGuideRouter from './routes/tourGuide.js';
import rentTransportationRouter from './routes/rentTransportation.js';

// GENERATE RANDOM VALUE
// const random64 = crypto.randomBytes(64).toString('hex');
// console.log('rand', random64);

const db = mysql.createConnection({
  host: process.env.SERVER_HOST,
  user: process.env.SERVER_USER,
  password: process.env.SERVER_PASSWORD,
  database: process.env.SERVER_DB,
});

db.connect((err) => {
  if (err) {
    throw err;
  }

  console.log('MySQL connected...');
});

const app = e();

// app.use(logger);
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { text: 'testing' });
});

//AUTH ROUTER

app.use(
  '/auth',
  (req, res, next) => {
    req.db = db;
    next();
  },
  authRouter
);

//USER ROUTER

app.use(
  '/user',
  (req, res, next) => {
    req.db = db;
    next();
  },
  userRouter
);

//LODGING RESERVATION ROUTER

app.use(
  '/lodging-reservation',
  authenticateToken,
  (req, res, next) => {
    req.db = db;
    next();
  },
  lodgingReservationRouter
);

//TOURIST DESTINATION ROUTER

app.use(
  '/tourist-destination',
  authenticateToken,
  (req, res, next) => {
    req.db = db;
    next();
  },
  touristDestinationRouter
);

app.use(
  '/tour-guide',
  authenticateToken,
  (req, res, next) => {
    req.db = db;
    next();
  },
  tourGuideRouter
);

app.use(
  '/rent-transportation',
  authenticateToken,
  (req, res, next) => {
    req.db = db;
    next();
  },
  rentTransportationRouter
);

// function logger(req, res, next) {
//   console.log(req.originalUrl);
//   next();
// }

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json('Unauthorized');

    req.user = user;

    next();
  });
}

app.listen(3000);
