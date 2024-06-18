import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import touristDestinationRouter from './routes/touristDestination.js';
import lodgingReservationRouter from './routes/lodgingReservation.js';
import tourGuideRouter from './routes/tourGuide.js';
import transportationRouter from './routes/transportation.js';
import rentTransportationRouter from './routes/rentTransportation.js';
import orderLodgingReservationRouter from './routes/orderLodgingReservation.js';
import orderTourGuideRouter from './routes/orderTourGuide.js';
import orderTransportationRouter from './routes/orderTransportation.js';
import dashboardRouter from './routes/dashboard.js';

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

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { text: 'testing' });
});

app.use((req, res, next) => {
  req.db = db;
  next();
});

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

app.use('/auth', authRouter);
app.use('/user', authenticateToken, userRouter);
app.use('/lodging-reservation', authenticateToken, lodgingReservationRouter);
app.use('/tourist-destination', authenticateToken, touristDestinationRouter);
app.use('/tour-guide', authenticateToken, tourGuideRouter);
app.use('/transportation', authenticateToken, transportationRouter);
app.use('/rent-transportation', authenticateToken, rentTransportationRouter);
app.use('/order-lodging-reservation', authenticateToken, orderLodgingReservationRouter);
app.use('/order-tour-guide', authenticateToken, orderTourGuideRouter);
app.use('/order-transportation', authenticateToken, orderTransportationRouter);
app.use('/dashboard', authenticateToken, dashboardRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
