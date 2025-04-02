require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { YOOKASSA_SHOP_ID, YOOKASSA_SECRET, RETURN_URL, WEBHOOK_SECRET } = process.env;

// ✅ API для создания платежа
app.post('/api/create-payment', async (req, res) => {
	const { orderId, amount } = req.body;

	try {
		const response = await axios.post(
			'https://api.yookassa.ru/v3/payments',
			{
				amount: { value: amount, currency: 'RUB' },
				capture: true,
				confirmation: { type: 'redirect', return_url: RETURN_URL },
				description: `Оплата заказа №${orderId}`
			},
			{
				auth: { username: YOOKASSA_SHOP_ID, password: YOOKASSA_SECRET },
				headers: { 'Idempotence-Key': orderId }
			}
		);

		res.json({ confirmation_url: response.data.confirmation.confirmation_url });
	} catch (error) {
		res.status(500).json({ error: error.response.data });
	}
});

// ✅ Webhook для подтверждения оплаты
app.post('/api/payment-webhook', async (req, res) => {
	const payment = req.body;

	if (payment.status === 'succeeded') {
		console.log(`✅ Заказ ${payment.description} оплачен.`);
		// Здесь можно обновить заказ в Webflow через API (если требуется)
	}

	res.sendStatus(200);
});

// Запуск сервера
app.listen(3000, () => console.log('🚀 Сервер запущен на порту 3000'));
