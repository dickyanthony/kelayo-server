import 'dotenv/config';
import e from 'express';
import Midtrans from 'midtrans-client';
import { Buffer } from 'buffer';
import axios from 'axios';

const snap = new Midtrans.Snap({
  isProduction: false,
  clientKey: process.env.MIDTRANS_CLIENT,
  serverKey: process.env.MIDTRANS_SERVER,
});

const router = e.Router();

router.post('/', (req, res) => {
  const {
    id,
    product,
    total,
    first_name,
    last_name,
    hp,
    start,
    end,

    user_id,
    type,
  } = req.body;

  console.log(req.body);

  const type_id =
    type === 'lodging_reservation'
      ? req.body.lodging_reservation_id
      : type === 'tour_guide'
      ? req.body.tour_guide_id
      : req.body.transportation_id;

  const customFieldValue = `${first_name},${last_name},${hp},${
    new Date().toISOString().split('T')[0]
  },${start},${end},${String(total)},${String(user_id)},${String(type_id)},1`;

  let parameter = {
    item_details: { name: product, price: total, quantity: 1 },
    transaction_details: {
      order_id: id,
      gross_amount: total,
    },

    custom_field1: type,
    custom_field2: customFieldValue,
  };
  console.log('parameter==>', type);
  snap
    .createTransactionToken(parameter)
    .then((response) => {
      return res.json(response);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send('Oops, Terjadi permasalahan!');
    });
});

router.get('/transaction/:order_id', (req, res) => {
  const { order_id } = req.params;
  axios
    .get(`https://api.sandbox.midtrans.com/v2/${order_id}/status`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        //Ini ga bole expose keluar, cuman karena ada issue dan hanya project testing gpp
        Authorization: 'Basic U0ItTWlkLXNlcnZlci05bmFKZ0txdHRJLXVtVnpjdzF6NjhFNWk6',
        // Authorization: `Basic ${'SB-Mid-server-9naJgKqttI-umVzcw1z68E5i'.toString('base64')}+ ':'`,
      },
    })
    .then((response) => {
      console.log('result==>', response.data);
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      console.log('err==>', error);
      res.status(500).send('Oops, Terjadi permasalahan!');
    });
});

export default router;
