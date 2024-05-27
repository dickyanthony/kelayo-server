import e from 'express';
const router = e.Router();

router.get('/get', (req, res) => {
  const db = req.db;
  const sql = 'SELECT * FROM lodgingReservation';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send('Oops, Terjadi permasalahan!');
      return;
    }
    res.json(results);
  });
});

export default router;
