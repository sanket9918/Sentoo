const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();

app.use(cors())
const user = require('./routes/user');
const property = require('./routes/property')
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());
const mongoURI = require('./config/key').mongoURL;

mongoose
    .connect(mongoURI,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }).then(() => {
            console.log('MongoDB connected successfully');
        }).catch((e) => {
            console.log('MongoDB cannot connect');
        })
app.use('/api/user', user);
app.use('/api/property', property)

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is up and running at ${port}`);
})