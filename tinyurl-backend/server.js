const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Set up SQLite with Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'tinyurl.db',
});

const Url = sequelize.define('Url', {
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv4,
    primaryKey: true,
  },
  originalUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

// Middleware
app.use(express.json());

// Deletion Function
const deleteExpiredUrls = async () => {
  try {
    const now = new Date();
    await Url.destroy({
      where: {
        expiryDate: {
          [Sequelize.Op.lt]: now
        }
      }
    });
    console.log('Expired URLs deleted successfully');
  } catch (error) {
    console.error('Error deleting expired URLs:', error);
  }
};

// Schedule the deletion task to run every day at midnight
cron.schedule('0 0 * * *', deleteExpiredUrls);

// Routes
app.post('/api/url', async (req, res) => {
  const { originalUrl, expiry } = req.body;

  const shortUrl = uuidv4().slice(0, 6);
  let expiryDate;

  switch (expiry) {
    case '1d':
      expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      break;
    case '30d':
      expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      return res.status(400).send('Invalid expiry option');
  }

  const url = await Url.create({ originalUrl, shortUrl, expiryDate });
  res.json({ shortUrl: `http://localhost:${port}/${shortUrl}` });
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  const url = await Url.findOne({ where: { shortUrl } });

  if (!url || new Date() > url.expiryDate) {
    return res.status(404).send('URL not found or expired');
  }

  res.redirect(url.originalUrl);
});

// Sync database and start server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
