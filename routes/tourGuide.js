import e from 'express';
const router = e.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { page = 1, limit = 9 } = req.body;
  const offset = (page - 1) * limit;

  let query = 'SELECT id, image, name FROM tourGuide';
  let countQuery = 'SELECT COUNT(*) AS totalData FROM tourGuide';
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
      tourGuide.id,
      tourGuide.name as title, 
      tourGuide.age, 
      tourGuide.domisili, 
      account.email AS email, 
      account.name,
      account.avatar
    FROM 
      tourGuide
    JOIN 
      account ON tourGuide.user_id = account.id
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
    tourGuide.id,
    tourGuide.name as title, 
    tourGuide.age, 
    tourGuide.domisili, 
    account.email AS email, 
    account.name,
    account.avatar
  FROM 
    tourGuide
  JOIN 
    account ON tourGuide.user_id = account.id
    WHERE 
      tourGuide.user_id = ?`;

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

  const query = 'SELECT * FROM tourGuide WHERE id = ?';

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

  const sql = 'DELETE FROM tourGuide WHERE id = ?';
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
