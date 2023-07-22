"use strict";

let express = require('express')
let bodyParser = require('body-parser');
let cors = require('cors');
var paypal = require('paypal-rest-sdk');
module.exports.stripe = require("stripe")(
  process.env.STRIPE_KEY
);

const dotenv = require('dotenv');
dotenv.config();
const app = express()

const port = process.env.PORT || 4000
//config
require('./App/config/config.js')
const client_id = "Ab7Od8gXOg-hCWDQMyvZw5oQ2mP6sJ9LFTPajFWMXnzD4HUpft5v_jnSFHzVcGSd7M40vFa8KKfZl5pp";
const Secret = "ECX-awV1PxxBjr-fLc8e5z0YXxXt0b7jAknGOSwogUdsmw6AD026eFEfdPz00FyR-J_BzBOG5aEWWMVb";

// CORS Policy
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// JSON
app.use('/upload', express.static('upload'));
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Routes
require('./App/routers/userRouter.js')(app)
require('./App/routers/socialRouter.js')(app)
require('./App/routers/eventRouter.js')(app)
require('./App/routers/walletRouter.js')(app)
require('./App/routers/addCardRouter.js')(app)
require('./App/routers/contactRouter.js')(app)
require("./App/routers/adminRouter.js")(app);
paypal.configure({
  'mode': 'live', // sandbox or live
  'client_id': client_id,
  'client_secret': Secret,
});

app.get('/', (req, res) => {
  res.status(200).send({ message: "routing is working", current: process.version })
  //  const create = User.create(req.body)
  //res.send('POST request to the homepage')
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})