import e from 'express';
import multer from 'multer';
const router = e.Router();

const upload = multer({
  limits: { fileSize: 500 * 1024 },
});

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

router.put('/:id', upload.single('image'), (req, res) => {
  const { id, name, age, status, domisili, competition, description, userId } = req.body;
  const db = req.db;

  if (!name || !age || !status || !domisili || !competition || !description) {
    return res.status(400).send('Isi Semua Bidang!');
  }

  let query;
  let values;

  if (id === 'undefined') {
    query = `
      INSERT INTO tourGuide
      (name, age, status, domisili, competition, description, user_id${
        req.file || req.body.image ? ', image' : ''
      })
      VALUES (?, ?, ?, ?, ?, ?, ?${req.file || req.body.image ? ', ?' : ''})
    `;

    values = [name, age, status, domisili, competition, description, userId];

    if (req.file) {
      values.push(req.file.buffer);
    } else if (req.body.image) {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      values.push(imageBuffer);
    }
  } else {
    query = `
      UPDATE tourGuide
      SET name = ?, age = ?, status = ?, domisili = ?, competition = ?, description = ?
      ${req.file || req.body.image ? ', image = ?' : ''}
      WHERE id = ?
    `;

    values = [name, age, status, domisili, competition, description];

    if (req.file) {
      values.push(req.file.buffer);
    } else if (req.body.image) {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      values.push(imageBuffer);
    }

    values.push(id);
  }

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Pemandu wisata tidak ditemukan');
    }
    const message =
      id === 'undefined' ? 'Pemandu wisata berhasil dibuat' : 'Pemandu wisata berhasil diupdate';
    res.status(200).send(message);
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
