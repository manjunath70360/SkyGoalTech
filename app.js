const bcrypt = require('bcrypt');
const express = require("express");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");
const path = require("path");
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await createUserTable();
    const PORT = process.env.PORT || 8050;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const createUserTable = async () => {
  try {
    await db.exec(`CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      phoneNum TEXT,
      address TEXT
    )`);
  } catch (err) {
    console.log(`Error creating user table: ${err.message}`);
    process.exit(1);
  }
};

app.get('/', (req, res) => {
  res.send('User API running');
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = ?`;
  const dbUser = await db.get(selectUserQuery, [username]);

  if (!dbUser) {
    response.status(400).json({ message: "Invalid user" });
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const payload = { id: dbUser.id, username: dbUser.username };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      response.json({ jwtToken, message: "Logged In" });
    } else {
      response.status(400).json({ message: "Invalid Password" });
    }
  }
});

app.post("/newuser", async (request, response) => {
  const { username, password, phoneNo, address } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = ?`;
  const dbUser = await db.get(selectUserQuery, [username]);

  if (!dbUser) {
    const createUserQuery = `
      INSERT INTO 
        user (username, password, phoneNum, address) 
      VALUES 
        (?, ?, ?, ?)`;
    const dbResponse = await db.run(createUserQuery, [username, hashedPassword, phoneNo, address]);
    const newUserId = dbResponse.lastID;
    response.json({ message: `Created new user with id ${newUserId}` });
  } else {
    response.status(400).json({ message: "User already exists" });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

app.get("/user", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const selectUserQuery = `SELECT username, phoneNum, address FROM user WHERE id = ?`;
  const user = await db.get(selectUserQuery, [userId]);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

module.exports = app;
