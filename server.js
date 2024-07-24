// const express = require('express');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const app = express();

// app.use(express.static('public'));
// app.use(express.json());

// app.post('/create-checkout-session', async (req, res) => {
//   const { price, description } = req.body;

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: description,
//           },
//           unit_amount: Math.round(price * 100), // Stripe uses cents
//         },
//         quantity: 1,
//       }],
//       mode: 'payment',
//       success_url: `${req.protocol}://${req.get('host')}/thanks.html`,
//       cancel_url: `${req.protocol}://${req.get('host')}/indexx.html`,
//     });

//     res.json({ id: session.id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// // Serve thanks.html
// app.get('/thanks.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'thanks.html'));
//   });

// // Serve index.html
// app.get('/index.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   });
  
// // Serve the root URL
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.get('/', (req, res) => {
//     res.render('index', { stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
//   });

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.static(__dirname));
app.use(express.json());

// Serve the Stripe publishable key
app.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.post('/create-checkout-session', async (req, res) => {
  const { price, description } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: description,
          },
          unit_amount: Math.round(price * 100), // Stripe uses cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/thanks.html`,
      cancel_url: `${req.protocol}://${req.get('host')}/index.html`,
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve thanks.html
app.get('/thanks.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'thanks.html'));
});

// Serve index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));