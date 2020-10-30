// load libraries
const express = require('express');
const handlebars = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;

// configure environment
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
const API_KEY = process.env.API_KEY;

// configure News API
const ENDPOINT = 'https://newsapi.org/v2/top-headlines';

// create an express instance
const app = express();

// configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}));
app.set('view engine', 'hbs');

// configure routes
app.get('/', (req,res) => {
    res.status(200);
    res.type('text/html');
    res.render('home');
})

app.post('/result', 
    express.urlencoded({extended: true}),
    express.json(),
    (req,res) => {

        console.log(`Request received: ${req.body}`);
        
        fetch(withQuery(ENDPOINT, {
            q: req.body.q,
            country: req.body.country,
            category: req.body.category,
            apiKey: API_KEY
        }))
        .then(res => res.json())
        .then((json) => {
            console.log(json);
            json.articles.forEach(element => {
                if (element.urlToImage === null) {
                    element.urlToImage = "/images/headline.png"
                }
            });
            res.status(200);
            res.type('text/html');
            res.render('result',{
                articles: json.articles
            });
        })
        .catch((err) => {
            console.error(err);
        });
    }
)

// load static resources
app.use(express.static(__dirname + '/public'));

// initialise the application
app.listen(PORT, () => {
    console.log(`Application started on PORT: ${PORT} at ${new Date()}`);
})


