import e from 'express';
const router = e.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { page = 1, limit = 9, type = 1 } = req.body;
  const offset = (page - 1) * limit;

  let query = 'SELECT id, image, name FROM rentTransportation';
  let countQuery = 'SELECT COUNT(*) AS totalData FROM rentTransportation';
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
  console.log('query==>', countQuery);
  console.log('params==>', countParams);
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

router.post('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { page = 1, limit = 9 } = req.body;
  const offset = (page - 1) * limit;

  let query = 'SELECT id, image, name, price FROM transportation WHERE id = ?';
  let countQuery = 'SELECT COUNT(*) AS totalData FROM transportation';
  const params = [];
  const countParams = [id];

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
