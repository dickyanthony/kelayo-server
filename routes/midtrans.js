import 'dotenv/config';
import e from 'express';
import Midtrans from 'midtrans-client';

const snap = new Midtrans.Snap({
  isProduction: false,
  clientKey: process.env.MIDTRANS_CLIENT,
  serverKey: process.env.MIDTRANS_SERVER,
});

const router = e.Router();

router.post('/', (req, res) => {
  const db = req.db;
  const { id, product, total } = req.body;

  let parameter = {
    item_details: { name: product, price: total, quantity: 1 },
    transaction_details: {
      order_id: id,
      gross_amount: total,
    },
  };
  snap
    .createTransactionToken(parameter)
    .then((response) => {
      return res.json(response);
    })
    .catch((err) => {
      return res.status(500).send('Oops, Terjadi permasalahan!');
    });
});

export default router;
