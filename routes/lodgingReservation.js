import e from 'express';
const router = e.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { page = 1, limit = 9 } = req.body;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM lodgingReservation';
  let countQuery = 'SELECT COUNT(*) AS totalData FROM lodgingReservation';
  const params = [];
  const countParams = [];

  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  db.query(countQuery, countParams, (err, countResults) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const totalData = countResults[0].totalData;
    const totalPage = Math.ceil(totalData / limit);

    db.query(query, params, (err, results) => {
      if (err) {
        return res.status(500).json('Oops, Terjadi permasalahan!');
      }

      res.json({
        listData: results,
        totalData,
        totalPage,
      });
    });
  });
});

router.post('/get-all', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const query = `
    SELECT 
      lodgingReservation.id,
      lodgingReservation.title, 
      lodgingReservation.price, 
      lodgingReservation.isFreeWifi, 
      lodgingReservation.isFreeWaterElectric, 
      lodgingReservation.isPrivateBathroom, 
      account.email AS email, 
      account.name,
      account.avatar
    FROM 
      lodgingReservation
    JOIN 
      account ON lodgingReservation.user_id = account.id
`;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json('Oops, Terjadi permasalahan!');
    }

    res.json(results);
  });
});

router.post('/user/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const query = `
  SELECT 
    lodgingReservation.id,
    lodgingReservation.title, 
    lodgingReservation.price, 
    lodgingReservation.isFreeWifi, 
    lodgingReservation.isFreeWaterElectric, 
    lodgingReservation.isPrivateBathroom, 
    account.email AS email, 
    account.name,
    account.avatar
  FROM 
    lodgingReservation
  JOIN 
    account ON lodgingReservation.user_id = account.id
    WHERE 
      lodgingReservation.user_id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json('Oops, Terjadi permasalahan!');
    }

    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const query = 'SELECT * FROM lodgingReservation WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json('Oops, Terjadi permasalahan!');
    }

    res.json(results[0]);
  });
});

router.delete('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const sql = 'DELETE FROM lodgingReservation WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      res.status(500).send('Oops, Terjadi permasalahan!');
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send('Data tidak ditemukan!');
      return;
    }

    res.json({ message: 'Data berhasil dihapus!' });
  });
});

export default router;
