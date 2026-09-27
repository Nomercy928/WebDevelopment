const express = require('express');
const morgan  = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());

// Server port
const HTTP_PORT = 3334;

// Logging
app.use(morgan('tiny'));
// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get('/', (req, res, next) => {
    res.json({'status': 'Alive'});
});

const userRoutes = require('./app/routes/user.server.routes');
app.use('/users', userRoutes);

// const coreRoutes = require('./app/routes/core.server.routes');
// app.use('/core', coreRoutes);
// const questionRoutes = require('./app/routes/question.server.routes');
// app.use('/questions', questionRoutes);

// Start server
app.listen(HTTP_PORT, () => {
    console.log('Server running on port: ' + HTTP_PORT);
});

// Default response for any other request
app.use((req, res) => {
    res.sendStatus(404);
});
