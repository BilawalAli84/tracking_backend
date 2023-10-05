require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://bilawal:C9rQjPUOoi5klXXA@cluster0.12dpeh0.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database')); 

app.use(express.json())
const track_down = require('./routes/track_down')
app.use('/track_down', track_down)
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
