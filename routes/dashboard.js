import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { userId } = req.body;

  let orderLodgingReservationQuery = `
    SELECT olr.status, COUNT(*) as count 
    FROM orderLodgingReservation olr
    JOIN lodgingReservation lr ON olr.lodging_reservation_id = lr.id
  `;
  let orderTransportationQuery = `
    SELECT ot.status, COUNT(*) as count 
    FROM orderTransportation ot
    JOIN transportation t ON ot.transportation_id = t.id
    JOIN rentTransportation rt ON t.rent_id = rt.id
  `;
  let orderTourGuideQuery = `
    SELECT otg.status, COUNT(*) as count 
    FROM orderTourGuide otg
    JOIN tourGuide tg ON otg.tour_guide_id = tg.id
  `;

  const params = [];
  if (userId) {
    orderLodgingReservationQuery += ` WHERE lr.user_id = ? GROUP BY olr.status`;
    orderTransportationQuery += ` WHERE rt.user_id = ? GROUP BY ot.status`;
    orderTourGuideQuery += ` WHERE tg.user_id = ? GROUP BY otg.status`;
    params.push(userId);
  } else {
    orderLodgingReservationQuery += ` GROUP BY olr.status`;
    orderTransportationQuery += ` GROUP BY ot.status`;
    orderTourGuideQuery += ` GROUP BY otg.status`;
  }

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(orderLodgingReservationQuery, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(orderTransportationQuery, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(orderTourGuideQuery, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }),
  ])
    .then(([lodgingResults, transportationResults, tourGuideResults]) => {
      const formatResults = (results, availableStatuses) => {
        const statusCountMap = results.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {});
        const status = availableStatuses;
        const value = status.map((s) => statusCountMap[s] || 0);
        return { status, value };
      };

      const availableStatuses = [1, 2, 3];

      const combinedResults = {
        orderLodgingReservation: formatResults(lodgingResults, availableStatuses),
        orderTransportation: formatResults(transportationResults, availableStatuses),
        orderTourGuide: formatResults(tourGuideResults, availableStatuses),
      };

      res.json(combinedResults);
    })
    .catch((err) => {
      res.status(500).send('Oops, Terjadi permasalahan!');
    });
});

router.post('/spark', async (req, res) => {
  const db = req.db;
  const { userId } = req.body;

  let orderLodgingReservationQuery = `
    SELECT olr.status, olr.trans as date, COUNT(*) as count 
    FROM orderLodgingReservation olr
  `;
  let orderTourGuideQuery = `
    SELECT otg.status, otg.trans as date, COUNT(*) as count 
    FROM orderTourGuide otg
  `;
  let orderTransportationQuery = `
    SELECT ot.status, ot.trans as date, COUNT(*) as count 
    FROM orderTransportation ot
  `;
  const params = [];

  if (userId) {
    orderLodgingReservationQuery += `
      JOIN lodgingReservation lr ON olr.lodging_reservation_id = lr.id
      WHERE lr.user_id = ?
    `;
    orderTourGuideQuery += `
      JOIN tourGuide tg ON otg.tour_guide_id = tg.id
      WHERE tg.user_id = ?
    `;
    orderTransportationQuery += `
      JOIN transportation t ON ot.transportation_id = t.id
      JOIN rentTransportation rt ON t.rent_id = rt.id
      WHERE rt.user_id = ?
    `;
    params.push(userId);
  }

  orderLodgingReservationQuery += ` GROUP BY olr.status, olr.trans;`;
  orderTourGuideQuery += ` GROUP BY otg.status, otg.trans;`;
  orderTransportationQuery += ` GROUP BY ot.status, ot.trans;`;

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(orderLodgingReservationQuery, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(orderTransportationQuery, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(orderTourGuideQuery, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }),
  ])
    .then(([lodgingResults, transportationResults, tourGuideResults]) => {
      const formatResults = (results) => {
        const dateCounts = {};

        [1, 2, 3].forEach((status) => {
          dateCounts[status] = {};
          results.forEach((result) => {
            const date = new Date(result.date).toISOString().slice(0, 10);
            dateCounts[status][date] = dateCounts[status][date] || 0;
          });
        });

        results.forEach((result) => {
          const date = new Date(result.date).toISOString().slice(0, 10);
          const status = result.status;
          dateCounts[status][date] += result.count;
        });

        const formattedResults = {};
        [1, 2, 3].forEach((status) => {
          formattedResults[status] = Object.entries(dateCounts[status])
            .filter(([date, count]) => count > 0)
            .map(([date, count]) => ({ label: date, value: count }));
        });

        return formattedResults;
      };
      const availableStatuses = [1, 2, 3];
      res.json({
        orderLodgingReservation: formatResults(lodgingResults, availableStatuses),
        orderTransportation: formatResults(transportationResults, availableStatuses),
        orderTourGuide: formatResults(tourGuideResults, availableStatuses),
      });
    })
    .catch((err) => {
      console.log('er==>', err);
      res.status(500).send('Oops, Terjadi permasalahan!');
    });
});

export default router;
