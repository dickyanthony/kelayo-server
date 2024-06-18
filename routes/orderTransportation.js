import e from 'express';

const router = e.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { transportationUserId } = req.body;

  let query = `
    SELECT 
      olr.*, 
      tg.name AS transportation_title, 
      acc.name AS account_name,
      acc.email AS account_email,
      acc.avatar AS account_avatar
    FROM orderTransportation olr
    JOIN transportation tg ON olr.transportation_id = tg.id
    JOIN rentTransportation rt ON tg.rent_id = rt.id
    JOIN account acc ON olr.user_id = acc.id
  `;

  const params = [];

  if (transportationUserId) {
    query += ` WHERE rt.user_id = ?`;
    params.push(transportationUserId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.log('err=>', err);
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
        title: result.transportation_title,
      },
    }));

    const finalResults = mappedResults.map(
      ({
        account_name,
        account_email,
        account_avatar,
        transportation_title,
        transportation_image,
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
      tg.name AS transportation_title, 
      acc.name AS account_name,
      acc.email AS account_email,
      acc.avatar AS account_avatar
    FROM orderTransportation olr
    JOIN transportation tg ON olr.transportation_id = tg.id
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
        title: result.transportation_title,
        description: result.transportation_description,
      },
    }));

    const finalResults = mappedResults.map(
      ({
        account_name,
        account_email,
        account_avatar,
        transportation_title,
        transportation_description,
        transportation_image,
        ...rest
      }) => rest
    );

    res.json(finalResults);
  });
});

// router.get('/get-by-tour-reservation/:transportationId', (req, res) => {
//   const db = req.db;
//   const transportationId = req.params.transportationId;

//   const query = 'SELECT * FROM orderTransportation WHERE transportation_id = ?';

//   db.query(query, [userId], (err, results) => {
//     if (err) {
//       console.log('err==>', err);
//       return res.status(500).send('Oops, Terjadi permasalahan!');
//     }
//     res.json(results);
//   });
// });

router.put('/:id', (req, res) => {
  const db = req.db;
  const id = req.params.id;
  const newStatus = req.body.status;

  const query = 'UPDATE orderTransportation SET status = ? WHERE id = ?';

  db.query(query, [newStatus, id], (err, result) => {
    if (err) {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }
    res.send('Status berhasil diperbaharui');
  });
});

export default router;
