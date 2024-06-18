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

router.get('/spark', async (req, res) => {
  const db = req.db;
  const { userId } = req.body;
  let orderLodgingReservationQuery = `
  SELECT status, trans as date, COUNT(*) as count 
  FROM orderLodgingReservation
  GROUP BY status, trans;
  `;
  let orderTransportationQuery = `
  SELECT status, trans as date, COUNT(*) as count 
  FROM orderTransportation
  GROUP BY status, trans;
  `;
  let orderTourGuideQuery = `
  SELECT status, trans as date, COUNT(*) as count 
  FROM orderTourGuide
  GROUP BY status, trans;
  `;
  const params = [];
  if (userId) {
    //   orderLodgingReservationQuery += ` WHERE lr.user_id = ? GROUP BY olr.status`;
    //   orderTransportationQuery += ` WHERE rt.user_id = ? GROUP BY ot.status`;
    //   orderTourGuideQuery += ` WHERE tg.user_id = ? GROUP BY otg.status`;
    //   params.push(userId);
    // } else {
    //   orderLodgingReservationQuery += ` GROUP BY olr.status`;
    //   orderTransportationQuery += ` GROUP BY ot.status`;
    //   orderTourGuideQuery += ` GROUP BY otg.status`;
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
      console.log('res==>', lodgingResults);
      console.log('res==>', transportationResults);
      const formatResults = (results) => {
        const dateCounts = {};

        // Initialize dateCounts with 0 counts for each status for all available dates
        [1, 2, 3].forEach((status) => {
          dateCounts[status] = {};
          results.forEach((result) => {
            const date = new Date(result.date).toISOString().slice(0, 10);
            dateCounts[status][date] = dateCounts[status][date] || 0;
          });
        });

        // Sum the counts for each date and status
        results.forEach((result) => {
          const date = new Date(result.date).toISOString().slice(0, 10);
          const status = result.status;
          dateCounts[status][date] += result.count;
        });

        // Format the result as an array of objects, excluding dates with 0 counts
        const formattedResults = {};
        [1, 2, 3].forEach((status) => {
          formattedResults[status] = Object.entries(dateCounts[status])
            .filter(([date, count]) => count > 0) // Filter out dates with 0 counts
            .map(([date, count]) => ({ label: date, value: count })); // Change 'date' to 'name'
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
      res.status(500).send('Oops, Terjadi permasalahan!');
    });
});

export default router;
