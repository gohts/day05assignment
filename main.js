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
let articlesRetrieved
let hasResult
let retrieveHitory = {}

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
        let queryString = req.body.q.trim().toLowerCase() + '$$' + req.body.country + '$$' + req.body.category;

        if ( (retrieveHitory[queryString]) && (new Date() - new Date(retrieveHitory[queryString].lastRetrieveTS)) < 15*60*1000 ) {

            console.log('retrieve from cache')

            articlesRetrieved = retrieveHitory[queryString].articles;
            hasResult = retrieveHitory[queryString].hasResult;

            res.status(200);
            res.type('text/html');
            res.render('result',{
                hasResult: hasResult,
                articles: articlesRetrieved
            });

        } else {

            console.log('retrieve from API')

            fetch(withQuery(ENDPOINT, {
                q: req.body.q,
                country: req.body.country,
                category: req.body.category,
                apiKey: API_KEY
            }))
            .then(res => res.json())
            .then((json) => {
                articlesRetrieved = json.articles;
                articlesRetrieved.forEach(element => {
                    if (element.urlToImage === null) {
                        element.urlToImage = "/images/headline.png"
                    }
                });

                hasResult = json.totalResults > 0

                retrieveHitory[queryString] = {
                            hasResult: hasResult,
                            articles: articlesRetrieved,
                            lastRetrieveTS: new Date()
                }
                res.status(200);
                res.type('text/html');
                res.render('result',{
                    hasResult: hasResult,
                    articles: articlesRetrieved
                });
            })
            .catch((err) => {
                console.error(err);
            });
        }
    }
)

// load static resources
app.use(express.static(__dirname + '/public'));

// initialise the application
app.listen(PORT, () => {
    console.log(`Application started on PORT: ${PORT} at ${new Date()}`);
})