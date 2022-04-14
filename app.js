const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')

const port = 8080;

app.set('view engine', 'ejs');   // use ejs as the view engine
app.use(express.json());         // access body using req.body
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// middleware to use static files
app.use('/assets', express.static('assets'));

//listen on port 8080
app.listen(port, () => {
    console.log("Server listening on port " + port);
    console.log('Your server is available at http://localhost:8080');
});

// homepage
app.get('/', (req, res) => {
    res.render('home');
});