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

router.put('/:id', upload.single('image'), (req, res) => {
  const {
    id,
    title,
    price,
    isFreeWifi,
    isFreeWaterElectric,
    isPrivateBathroom,
    description,
    userId,
  } = req.body;
  const db = req.db;

  if (
    !title ||
    !price ||
    !isFreeWifi ||
    !isFreeWaterElectric ||
    !isPrivateBathroom ||
    !description
  ) {
    return res.status(400).send('Isi Semua Bidang!');
  }

  let query;
  let values;

  if (id === 'undefined') {
    query = `
      INSERT INTO lodgingReservation
      (title, price, isFreeWifi, isFreeWaterElectric, isPrivateBathroom, description, user_id${
        req.file || req.body.image ? ', image' : ''
      })
      VALUES (?, ?, ?, ?, ?, ?, ?${req.file || req.body.image ? ', ?' : ''})
    `;

    values = [
      title,
      price,
      isFreeWifi,
      isFreeWaterElectric,
      isPrivateBathroom,
      description,
      userId,
    ];

    if (req.file) {
      values.push(req.file.buffer);
    } else if (req.body.image) {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      values.push(imageBuffer);
    }
  } else {
    query = `
      UPDATE lodgingReservation
      SET title = ?, price = ?, isFreeWifi = ?, isFreeWaterElectric = ?, isPrivateBathroom = ?, description = ?
      ${req.file || req.body.image ? ', image = ?' : ''}
      WHERE id = ?
    `;

    values = [title, price, isFreeWifi, isFreeWaterElectric, isPrivateBathroom, description];

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
      return res.status(404).send('Penginapan tidak ditemukan');
    }
    const message =
      id === 'undefined' ? 'Penginapan berhasil dibuat' : 'Penginapan berhasil diupdate';
    res.status(200).send(message);
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
