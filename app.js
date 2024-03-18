// Load the necessary dependencies to be used in this code
const express = require("express");
const bodyParser = require("body-parser");
const secret = "123456789"; // Secret key for JWT authentication

// Initialize the Express.js server and store it in a variable
// so it can be used as 'app'
const app = express();

// Add bodyParser middleware to handle JSON payloads in requests
app.use(bodyParser.json());

// Use bodyParser to process JSON payloads in requests
let todos = []; // In-memory storage for todos

// JWT route protection middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // If no token, return 401

  jwt.verify(token, secret, (err, user) => {
      if (err) return res.sendStatus(403); // If token is invalid, return 403
      req.user = user;
      next();
  });
}

// POST endpoint to create a new todo item
// expects `title` and optionally `completed` in the request body as JSON
app.post("/todos", authenticateToken, (req, res) => {
  // check if the title was provided
    if (req.body.title === undefined) {
        res.status(400).json({error: "Title could not be found"});
    }
    
  // create a new todo
  const todo = {
    id: todos.length + 1, // ID is the length of the list + 1
    title: req.body.title, // title taken from the request body
    completed: req.body.completed || false, // completion state, false by default
  };
  // add the new todo to the list
  todos.push(todo);

  // send response with status 201 (Created) and the todo object
  res.status(201).json(todo);
});

// GET endpoint to retrieve a todo item by its ID
app.get("/todos/:id", authenticateToken, (req, res) => {
    // parse the ID to retrieve a todo item by its ID
    const todoId = parseInt(req.params.id);

    let foundItem;
    // search for the todo item by ID
    for (let item of todos) {

        if (item.id === todoId) {
            foundItem = item;
            break;
        }
    }

    // if the item is found, send it back, otherwise send an error
    if (foundItem !== undefined) {
        res.status(200).json(foundItem);
    } else {
        res.status(404).json({ error: 'Todo not found' });
    }
});

const bcrypt = require('bcrypt');

let users = [];

// registration endpoint
app.post('/register', async (req, res) => {
  console.log(req.body);

  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = { username: req.body.username, password: hashedPassword };
      users.push(user);
      res.status(201).send('User created');
  } catch {
      res.status(500).send();
  }
});

const jwt = require('jsonwebtoken');

// authentication endpoint
app.post('/login', async (req, res) => {
  // User authentication
  const user = users.find(u => u.username === req.body.username);
  if (user == null) {
      return res.status(400).send('Cannot find user');
  }
  console.log("Attempting to authenticate user", req.body.username);
  try {
      if (await bcrypt.compare(req.body.password, user.password)) {
          console.log("Password verified for user", req.body.username);
          const accessToken = jwt.sign({ username: user.username }, secret);
          res.json({ accessToken: accessToken });
      } else {
          res.send('Not Allowed');
      }
  } catch (error) {
      console.error("Error in /login", error);
      res.status(500).send();
  }
});

app.get('/todos', authenticateToken, (req, res) => {
  res.json(todos);
});

// Run the server on port 3000
// Local URL: http://localhost:3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
