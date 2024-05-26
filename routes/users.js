import e from 'express';
const router = e.Router();

router.get('/', (req, res) => {
  console.log('tes');
  res.render('index', { text: 'testing' });
});

router.get('/new', (req, res) => {
  res.send('User New Form');
});

//REGISTER
router.post('/register', (req, res) => {
  const { name, username, email, password, gender } = req.body;
  const db = req.db;

  if (!name || !username || !email || !password || !gender) {
    return res.status(400).send('Isi Semua Bidang!');
  }

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }

    const sql =
      'INSERT INTO account (name, username, email, password, gender) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, username, email, hash, gender], (err, result) => {
      if (err) {
        return res.status(500).send('Oops, Terjadi permasalahan!');
      }
      res.status(201).send('Daftar Berhasil');
    });
  });
});

//LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  if (!email || !password) {
    return res.status(400).send('Isi Semua Bidang!');
  }

  const sql = 'SELECT id, email, name, gender FROM account WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }

    if (results.length === 0) {
      return res.status(401).send('Email atau password tidak sesuai');
    }

    const user = results[0];
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
    });
  });
});

export default router;
