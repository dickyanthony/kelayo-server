import e from 'express';

const router = e.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { tourGuideUserId } = req.body;

  let query = `
    SELECT 
      olr.*, 
      tg.name AS tour_title, 
      tg.description AS tour_description, 
      acc.name AS account_name,
      acc.email AS account_email,
      acc.avatar AS account_avatar
    FROM orderTourGuide olr
    JOIN tourGuide tg ON olr.tour_guide_id = tg.id
    JOIN account acc ON olr.user_id = acc.id
  `;

  if (tourGuideUserId) {
    query += ` WHERE tg.user_id = ${db.escape(tourGuideUserId)}`;
  }

  db.query(query, (err, results) => {
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
        title: result.tour_title,
        description: result.tour_description,
      },
    }));

    const finalResults = mappedResults.map(
      ({
        account_name,
        account_email,
        account_avatar,
        tour_title,
        tour_description,
        tour_image,
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
      tg.name AS tour_title, 
      tg.description AS tour_description, 
      acc.name AS account_name,
      acc.email AS account_email,
      acc.avatar AS account_avatar
    FROM orderTourGuide olr
    JOIN tourGuide tg ON olr.tour_guide_id = tg.id
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
        title: result.tour_title,
        description: result.tour_description,
      },
    }));

    const finalResults = mappedResults.map(
      ({
        account_name,
        account_email,
        account_avatar,
        tour_title,
        tour_description,
        tour_image,
        ...rest
      }) => rest
    );

    res.json(finalResults);
  });
});

router.post('/create-transaction', (req, res) => {
  const {
    id,
    tour_guide_id,
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
    'INSERT INTO orderTourGuide  (id, tour_guide_id, first_name, last_name, hp, trans, start, end, total_price, image, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  const values = [
    id,
    tour_guide_id,
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
    if (err) {
      return res.status(500).json('Oops, Terjadi permasalahan!');
    }
    res.status(200).json('Order Berhasil Ditambahkan');
  });
});

// router.get('/get-by-tour-reservation/:tourGuideId', (req, res) => {
//   const db = req.db;
//   const tourGuideId = req.params.tourGuideId;

//   const query = 'SELECT * FROM orderTourGuide WHERE tour_guide_id = ?';

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

  const query = 'UPDATE orderTourGuide SET status = ? WHERE id = ?';

  db.query(query, [newStatus, id], (err, result) => {
    if (err) {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    }
    res.send('Status berhasil diperbaharui');
  });
});

export default router;
