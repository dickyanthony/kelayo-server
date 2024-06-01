import e from 'express';
import multer from 'multer';

const router = e.Router();

const upload = multer({
  limits: { fileSize: 500 * 1024 },
});

router.get('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const query = 'SELECT id, name, username, email, avatar FROM account WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }

    if (results.length === 0) {
      return res.status(404).send('Akun tidak ditemukan');
    }

    res.json(results[0]);
  });
});

router.post('/get-all', (req, res) => {
  const db = req.db;

  const query = `
    SELECT 
      id,
      name,
      username,
      email,
      gender,
      role,
      avatar
    FROM 
      account
   
`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json('Oops, Terjadi permasalahan!');
    }
    res.json(results);
  });
});

router.put('/:id', upload.single('image'), (req, res) => {
  const { id, nama } = req.body;
  const db = req.db;

  if (!id || !nama) {
    return res.status(400).send('Missing required fields');
  }

  let query = 'UPDATE account SET name = ?';
  const values = [nama];

  if (req.file) {
    const imageBuffer = req.file.buffer;
    query += ', avatar = ?';
    values.push(imageBuffer);
  } else if (req.body.image) {
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    query += ', avatar = ?';
    values.push(imageBuffer);
  }

  query += ' WHERE id = ?';
  values.push(id);

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Pengguna tidak ditemukan');
    }
    res.status(200).send('Profil berhasil diupdate');
  });
});

router.delete('/:id', (req, res) => {
  const db = req.db;

  const { id } = req.params;
  const sql = 'DELETE FROM account WHERE id = ?';

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
