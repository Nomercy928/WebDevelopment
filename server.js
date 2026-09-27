const express = require('express');
const morgan  = require('morgan');
const mongoose = require('mongoose'); //新增
const bodyParser = require('body-parser');
const cors = require('cors');
    

const app = express();
app.use(cors());

// ======== 数据库连接 ========
mongoose.connect('mongodb://127.0.0.1:27017/auctionDB')
.then(()=>{
    console.log("✅ MongoDB连接成功");
})
.catch(err=>{
    console.log("❌ MongoDB连接失败",err);
})

// Server port
const HTTP_PORT = 3334;

// Start server
app.listen(HTTP_PORT, () => {
    console.log('Server running on port: ' + HTTP_PORT);
});

// Logging
app.use(morgan('tiny'));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get('/', (req, res, next) => {
    res.json({'status': 'Alive'});
});

// Other API endpoints: Links go here...
// You can uncomment the below three lines as you implement the functionality - we'll discuss this structure in week three.
require('./app/routes/user.server.routes')(app);
require('./app/routes/core.server.routes')(app);
require('./app/routes/question.server.routes')(app);


// Default response for any other request
app.use((req, res) => {
    res.sendStatus(404);
});