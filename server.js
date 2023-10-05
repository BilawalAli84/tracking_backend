require('dotenv').config()
const cors = require('cors');
const express = require('express');
const app = express();
app.use(cors());
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database')); 

app.use(express.json())
const track_down = require('./routes/track_down')
app.use('/track_down', track_down)
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
