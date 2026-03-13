require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // ISSUE-0028 FIX

const users = require('./routes/users');
const products = require('./routes/products');
const orders = require('./routes/orders');

const app = express();

app.use(helmet());

// ISSUE-0031: CORS too open in release
app.use(cors());

// ISSUE-0028 FIX: Add rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});

app.use(limiter);

// ISSUE-0024 FIX: prevent server crash on invalid JSON
app.use((req, res, next) => {
  let data = '';

  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', () => {
    if (data && (req.headers['content-type'] || '').includes('application/json')) {
      try {
        req.body = JSON.parse(data);
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid JSON format'
        });
      }
    }
    next();
  });

  req.on('error', err => {
    return res.status(400).json({
      error: 'Request error'
    });
  });
});

// ISSUE-0023: request logging missing in release (no morgan)

// ISSUE-0035: /health endpoint missing in release

app.use('/users', users);
app.use('/products', products);
app.use('/orders', orders);

// ISSUE-0016/0030: error handling inconsistent and stack logging not improved
app.use((err, req, res, next) => {
  res.status(500).send('Server error');
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API running on port ${port}`));