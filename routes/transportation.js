import e from 'express';
import multer from 'multer';
const router = e.Router();

const upload = multer({
  limits: { fileSize: 500 * 1024 },
});

router.post('/', (req, res) => {
  const db = req.db;
  const { id } = req.body;

  const query = 'SELECT * FROM transportation WHERE rent_id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json('Oops, Terjadi permasalahan!');
    }

    res.json(results);
  });
});

router.delete('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const sql = 'DELETE FROM transportation WHERE id = ?';
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

router.put('/:id', upload.single('image'), (req, res) => {
  const { id, name, price, rentId } = req.body;
  const db = req.db;

  if (!name || !price) {
    return res.status(400).send('Isi Semua Bidang!');
  }
  console.log('id==>', id);
  let query;
  let values;

  if (id === 'undefined') {
    query = `
      INSERT INTO transportation
      (name, price,  rent_id${req.file || req.body.image ? ', image' : ''})
      VALUES (?, ?, ?${req.file || req.body.image ? ', ?' : ''})
    `;

    values = [name, price, rentId];

    if (req.file) {
      values.push(req.file.buffer);
    } else if (req.body.image) {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      values.push(imageBuffer);
    }
  } else {
    query = `
      UPDATE transportation
      SET name = ?, price = ?
      ${req.file || req.body.image ? ', image = ?' : ''}
      WHERE id = ?
    `;

    values = [name, price];

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
      console.log('err==>', err);
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Pemandu wisata tidak ditemukan');
    }
    const message =
      id === 'undefined' ? 'Pemandu wisata berhasil dibuat' : 'Pemandu wisata berhasil diupdate';
    res.status(200).send(message);
  });
});

export default router;
