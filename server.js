const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();
const db = require('./config/keys.js').mongoURI;

const helmet = require('helmet');

app.use(helmet());

//body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const users = require('./routes/api/users');

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).then(
    () => {
        console.log("MongoDB connected")
    }
).catch(() => {
    console.log("Error")
});

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Define Routes
app.use('/api/users', users);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});
