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

  let query = `
    SELECT SQL_CALC_FOUND_ROWS 
      transportation.id, 
      transportation.image, 
      transportation.name, 
      transportation.price,
      rentTransportation.name as storeName,
      rentTransportation.image as storeImage,
      rentTransportation.id AS rentTransportationId
    FROM transportation
    JOIN rentTransportation ON transportation.rent_id = rentTransportation.id
    WHERE transportation.id = ?
    LIMIT ? OFFSET ?
  `;

  const params = [parseInt(id), parseInt(limit), parseInt(offset)];

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.query('SELECT FOUND_ROWS() AS totalData', (err, countResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalData = countResults[0].totalData;
      const totalPage = Math.ceil(totalData / limit);

      const storeImage = results.length > 0 ? results[0].storeImage : null;
      const storeName = results.length > 0 ? results[0].storeName : null;

      const listData = results.map(({ storeImage, storeName, ...item }) => item);

      res.json({
        storeImage,
        storeName,
        listData,
        totalData,
        totalPage,
      });
    });
  });
});

router.get('/transportation/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const query = 'SELECT * FROM transportation WHERE id = ?';

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
