import e from 'express';

const router = e.Router();

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
