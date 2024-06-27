import e from 'express';

const router = e.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { lodgingReservationUserId } = req.body;

  let query = `
    SELECT 
      olr.*, 
      lr.title AS lodging_title, 
      lr.description AS lodging_description, 
      acc.name AS account_name,
      acc.email AS account_email,
      acc.avatar AS account_avatar
    FROM orderLodgingReservation olr
    JOIN lodgingReservation lr ON olr.lodging_reservation_id = lr.id
    JOIN account acc ON olr.user_id = acc.id
  `;

  if (lodgingReservationUserId) {
    query += ` WHERE lr.user_id = ${db.escape(lodgingReservationUserId)}`;
  }
  console.log('query===>', query);
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }

    const mappedResults = results.map((result) => ({
      ...result,
      account: {
        name: result.account_name,
        email: result.account_email,
        avatar: result.account_avatar,
      },
      product: {
        title: result.lodging_title,
        description: result.lodging_description,
      },
    }));

    const finalResults = mappedResults.map(
      ({
        account_name,
        account_email,
        account_avatar,
        lodging_title,
        lodging_description,
        lodging_image,
        ...rest
      }) => rest
    );

    res.json(finalResults);
  });
});
router.get('/:userId', (req, res) => {
  const db = req.db;
  const userId = req.params.userId;

  const query = `
    SELECT 
      olr.*, 
      lr.title AS lodging_title, 
      lr.description AS lodging_description, 
      acc.name AS account_name,
      acc.email AS account_email,
      acc.avatar AS account_avatar
    FROM orderLodgingReservation olr
    JOIN lodgingReservation lr ON olr.lodging_reservation_id = lr.id
    JOIN account acc ON olr.user_id = acc.id
    WHERE olr.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }
    const mappedResults = results.map((result) => ({
      ...result,
      account: {
        name: result.account_name,
        email: result.account_email,
        avatar: result.account_avatar,
      },
      product: {
        title: result.lodging_title,
        description: result.lodging_description,
      },
    }));

    const finalResults = mappedResults.map(
      ({
        account_name,
        account_email,
        account_avatar,
        lodging_title,
        lodging_description,
        lodging_image,
        ...rest
      }) => rest
    );

    res.json(finalResults);
  });
});

// router.get('/get-by-lodging-reservation/:lodgingReservationId', (req, res) => {
//   const db = req.db;
//   const lodgingReservationId = req.params.lodgingReservationId;

//   const query = 'SELECT * FROM orderLodgingReservation WHERE lodging_reservation_id = ?';

//   db.query(query, [userId], (err, results) => {
//     if (err) {
//       console.log('err==>', err);
//       return res.status(500).send('Oops, Terjadi permasalahan!');
//     }
//     res.json(results);
//   });
// });

router.post('/create-transaction', (req, res) => {
  const {
    id,
    lodging_reservation_id,
    first_name,
    last_name,
    hp,
    trans,
    start,
    end,
    total_price,
    image,
    user_id,
    status,
  } = req.body;
  const db = req.db;

  const sql =
    'INSERT INTO orderLodgingReservation (id, lodging_reservation_id, first_name, last_name, hp, trans, start, end, total_price, image, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  const values = [
    id,
    lodging_reservation_id,
    first_name,
    last_name,
    hp,
    trans,
    start,
    end,
    total_price,
    image,
    user_id,
    status,
  ];

  db.query(sql, values, (err, result) => {
    console.log('er==>', err);
    if (err) {
      return res.status(500).json('Oops, Terjadi permasalahan!');
    }
    res.status(200).json('Order Berhasil Ditambahkan');
  });
});

router.put('/:id', (req, res) => {
  const db = req.db;
  const id = req.params.id;
  const newStatus = req.body.status;

  const query = 'UPDATE orderLodgingReservation SET status = ? WHERE id = ?';

  db.query(query, [newStatus, id], (err, result) => {
    if (err) {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }
    res.send('Status berhasil diperbaharui');
  });
});

export default router;
