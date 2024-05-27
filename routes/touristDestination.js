// import e from 'express';
// import bcrypt from 'bcryptjs';
// const router = e.Router();
// const saltRounds = 10;

// // REGISTER
// router.post('/register', (req, res) => {
//   const { nama, username, email, password, gender, role } = req.body;
//   const db = req.db;

//   if (!nama || !username || !email || !password || !gender || !role) {
//     return res.status(400).send('Isi Semua Bidang!');
//   }

//   const emailCheckSql = 'SELECT email FROM account WHERE email = ?';
//   db.query(emailCheckSql, [email], (err, results) => {
//     if (err) {
//       return res.status(500).send('Oops, Terjadi permasalahan!');
//     }
//     if (results.length > 0) {
//       return res.status(409).send('Email sudah digunakan, silakan coba yang lain.');
//     }

//     bcrypt.hash(password, saltRounds, (err, hash) => {
//       if (err) {
//         return res.status(500).send('Oops, Terjadi permasalahan!');
//       }

//       const sql =
//         'INSERT INTO account (name, username, email, password, gender, role) VALUES (?, ?, ?, ?, ?, ?)';
//       db.query(sql, [nama, username, email, hash, gender, role], (err, result) => {
//         if (err) {
//           return res.status(500).send('Oops, Terjadi permasalahan!');
//         }
//         const userId = result.insertId;

//         res.status(201).json({
//           id: userId,
//           name: nama,
//           username: username,
//           email: email,
//           gender: gender,
//           role: role,
//         });
//       });
//     });
//   });
// });

// // LOGIN
// router.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   const db = req.db;

//   if (!email || !password) {
//     return res.status(400).send('Isi Semua Bidang!');
//   }

//   const sql =
//     'SELECT id, username, email, password, name, gender,role FROM account WHERE email = ?';
//   db.query(sql, [email], (err, results) => {
//     if (err) {
//       return res.status(500).send('Oops, Terjadi permasalahan!');
//     }
//     if (results.length === 0) {
//       return res.status(401).send('Email atau password tidak sesuai');
//     }

//     const user = results[0];
//     bcrypt.compare(password, user.password, (err, isMatch) => {
//       if (err) {
//         return res.status(500).send('Terjadi kesalahan saat memeriksa kata sandi.');
//       }
//       if (!isMatch) {
//         return res.status(401).send('Email atau password tidak sesuai');
//       }

//       res.status(200).json({
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         username: user.username,
//         gender: user.gender,
//         role: user.role,
//       });
//     });
//   });
// });

// export default router;
