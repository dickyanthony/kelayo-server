import e from 'express';
const router = e.Router();

router.post('/get', (req, res) => {
  const db = req.db;
  const { type, page = 1, limit = 9 } = req.body;
  const offset = (page - 1) * limit;

  let query = 'SELECT id, title, location, description, price, image1 FROM touristDestination';
  let countQuery = 'SELECT COUNT(*) AS totalData FROM touristDestination';
  const params = [];
  const countParams = [];

  if (type) {
    query += ' WHERE type = ?';
    countQuery += ' WHERE type = ?';
    params.push(type);
    countParams.push(type);
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
        return res.status(500).json({ error: err.message });
      }

      res.json({
        listData: results,
        totalData,
        totalPage,
      });
    });
  });
});

router.get('/get/:id', (req, res) => {
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

export default router;
