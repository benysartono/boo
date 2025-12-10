require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bodyParser = require('body-parser');

const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');

const app = express();

// Start in-memory MongoDB
(async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log("Connected to in-memory MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
})();

// View engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Static
app.use('/boo', express.static(__dirname + '/public'));

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/boo', profileRoutes);
app.use('/boo/users', userRoutes);
app.use('/boo/comments', commentRoutes);

module.exports = app;
