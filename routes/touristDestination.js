import e from 'express';
const router = e.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { type, name, minPrice, maxPrice, page = 1, limit = 9 } = req.body;
  const offset = (page - 1) * limit;

  let query =
    'SELECT id, title, location, description, price, image1 FROM touristDestination WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) AS totalData FROM touristDestination WHERE 1=1';
  const params = [];
  const countParams = [];

  if (type) {
    query += ' AND type = ?';
    countQuery += ' AND type = ?';
    params.push(type);
    countParams.push(type);
  }

  if (name) {
    query += ' AND title LIKE ?';
    countQuery += ' AND title LIKE ?';
    params.push(`%${name}%`);
    countParams.push(`%${name}%`);
  }

  if (minPrice) {
    query += ' AND price >= ?';
    countQuery += ' AND price >= ?';
    params.push(parseInt(minPrice));
    countParams.push(parseInt(minPrice));
  }

  if (maxPrice) {
    query += ' AND price <= ?';
    countQuery += ' AND price <= ?';
    params.push(parseInt(maxPrice));
    countParams.push(parseInt(maxPrice));
  }

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

router.get('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const query = 'SELECT * FROM touristDestination WHERE id = ?';

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

  const sql = 'DELETE FROM touristDestination WHERE id = ?';
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

router.post('/get-all', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const query = `
    SELECT 
    touristDestination.id,
      touristDestination.title, 
      touristDestination.type, 
      touristDestination.location, 
      touristDestination.price, 
      account.email AS email, 
      account.name,
      account.avatar
    FROM 
      touristDestination
    JOIN 
      account ON touristDestination.user_id = account.id
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
  touristDestination.id,
    touristDestination.title, 
    touristDestination.type, 
    touristDestination.location, 
    touristDestination.price, 
    account.email AS email, 
    account.name,
    account.avatar
  FROM 
    touristDestination
  JOIN 
    account ON touristDestination.user_id = account.id
    WHERE 
      touristDestination.user_id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json('Oops, Terjadi permasalahan!');
    }

    res.json(results);
  });
});

export default router;
