const express = require('express');
const app = express();
// const errorHandler = require('./middleware/errorHandler')
// const logger = require('./middleware/logger')
const matcher = require('./routes/matcher')
// const path = require('path');
const port = process.env.PORT;

// Set up EJS as the view engine
// app.set('view engine', 'ejs');

// app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// other middleware
// app.use(logger);
// app.use(errorHandler);

// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));   

// Define routes
app.use('/matcher', matcher);

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});