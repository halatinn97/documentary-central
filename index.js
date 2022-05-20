
const express = require('express');
const app = express();

let topMovies = [
  {
    title: 'Harry Potter & the Sorcere\'s Stone',
    year: '2001',
    director: 'Chris Columbus'
  },
  {
    title: 'Johnny English',
    year: '2003',
    director: 'Peter Howitt',
  },
  {
    title: 'Big Momma\'s House',
    year: '2000',
    director: 'Raja Gosnell'
  },
  {
    title: 'Big Momma\'s House 2',
    year: '2006',
    director: 'John Whitesell'
  },
  {
    title: 'Titanic',
    year: '1997',
    director: 'James Cameron'
  },
  {
    title: 'Avater',
    year: '2009',
    director: 'James Cameron',
  },
  {
    title: 'Jumanji: The Next Level',
    year: '2019',
    director: 'Jake Kasdan'
  },
  {
    title: 'Schindler\'s List',
    year: '1994',
    director: 'Steven Spielberg',
  },
  {
    title: 'Lion',
    year: '2016',
    director: 'Garth Davis'
  },
  {
    title: 'Spirited Away',
    year: '2003',
    director: 'Hayao Miyazaki'
  }
]

//GET requests

app.get('/movies', (req,res) => {
  res.json(topMovies);
});

app.get('/', (req,res) => {
  res.send('What is your favorite movie?');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

app.use(express.static('public'));

//Log requests
const morgan = require('morgan');

app.use(morgan('common'));


//Error handling

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oops, something went wrong!');
});


//Start server
app.listen(8080,() => {
  console.log('Server is listening on port 8080.')
});
