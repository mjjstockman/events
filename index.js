const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const createError = require('http-errors');
const { User } = require('./models/user');
const { Event } = require('./models/event');
const { v4: uuidv4 } = require('uuid');

const port = 3001;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// authentification MUST be done before any other route
// this is called every time a user logs in
app.post('/auth', async (req, _, next) => {
  console.log('logging in!!!!');
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    // REFRACTOR BELOW IF'S INTO ONE
    if (!user) {
      return next(createError(401, 'Wrong credentials'));
    }
    if (req.body.password !== user.password) {
      return next(createError(401, 'Wrong credentials'));
    }
    // generate token using uuid and add it as a property to user
    user.token = uuidv4();
    // save user with token
    await user.save();
    // send back token so can set it in local storage on front end
    res.send({
      token: user.token,
    });
  } catch (err) {
    return next(createError(500, 'Internal Server Error'));
  }
});

// check if header contains token (sent from auth route above)
app.use(async (req, _, next) => {
  //
  const authHeader = req.headers.authorization;
  // get user from db using token
  const user = await User.findOne({ token: authHeader });
  // if is user with that token, continue to next function
  if (user) {
    next();
  } else {
    return next(createError(401, 'Not authorized'));
  }
});

// GET ALL EVENTS when user visits homepage
app.get('/', async (_, res, next) => {
  try {
    const data = await Event.find();
    res.send(data);
  } catch (err) {
    return next(createError(500, 'Internal Server Error'));
  }
});

// ADD NEW EVENT
// create event
app.post('/', async (req, res, next) => {
  try {
    const { name, price } = new req.body();
    // REFRACTOR!!!!!!!!
    if (!name || !location || !details || !price || !image) {
      return next(createError(400, 'Missing fields'));
    }

    const newEvent = new Event({
      name,
      location,
      details,
      price,
      image,
    });

    // save event
    const savedEvent = await newEvent.save();

    // send message obj with value informing user that event was saved
    res.send({
      message: 'Event saved',
    });
  } catch (err) {
    return next(createError(500, 'Internal Server Error'));
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// DELETE an event (id sent in params)
app.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(createError(400, 'Missing id'));
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    res.send({
      message: 'Event deleted',
    });
  } catch (err) {
    return next(createError(500, 'Internal Server Error'));
  }
});

// UPDATE an event (id sent in params)
app.put('/:id', async (req, res, next) => {
  try {
    // get id from params
    const { id } = req.params;
    // get event from body using id
    await Event.findByIdAndUpdate(id, req.body);
    // inform user that event was updated
    res.send({
      message: 'Event updated',
    });
  } catch (err) {
    return next(createError(500, 'Internal Server Error'));
  }
});
