const express = require('express');
const morgan = require('morgan');
const path = require('path');
const { engine } = require('express-handlebars')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
const MySqlStore = require('express-mysql-session');

const { database } = require('./keys');

//initializations
const app = express();
require('./src/lib/passport');

//settings
app.set('port', process.env.PORT || 4000)
app.set('views', path.join(__dirname, 'src/views')); 
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./src/lib/handlebars')
}))

app.set('view engine', '.hbs')

//Middlewares
app.use(session({
    secret: 'jmpcsession',
    resave: false,
    saveUninitialized: false,
    store: new MySqlStore(database)
}))
app.use(flash())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(passport.initialize());
app.use(passport.session())

//Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.success = req.flash('message');
    app.locals.user = req.user;
    next();
})

//Routes

app.use(require('./src/routes'));
app.use(require('./src/routes/authentication'));
app.use('/links', require('./src/routes/links')); 


//Public 
app.use(express.static(path.join(__dirname, '/src/public'))) 

//Starting the server 
app.listen(app.get('port'), ()=>{
    console.log('Server on port: ', app.get('port'))
})


