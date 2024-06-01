import e from 'express';

const router = e.Router();

router.post('/get-all', (req, res) => {
  const db = req.db;
  const { id } = req.params;

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
