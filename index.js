const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
import { neon } from "@neondatabase/serverless";

if (process.env.JWT_SECRET) {
  sql = neon(process.env.JWT_SECRET);
}

async function getUser(email) {
  const data = await sql(`SELECT * FROM accounts WHERE email = ${email}`);
  return data[0];
}
async function addUser(id, name, email, pass) {
  const data = await sql(
    `INSERT INTO accounts(name, email, pass) VALUES(${name}, ${email}, ${pass})`
  );
  return data[0];
}
async function addToken(id, token) {
  await sql(
    `INSERT INTO tokens(id, token)
  OVERRIDING SYSTEM VALUE
  VALUES (${id}, ${token})`
  );
}

require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors());
const salt = bcrypt.genSaltSync(2);

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(422).json({ message: "email, password, name is not declared" });
  }
  // we need to check whether user is already exist
  if (getUser(email)) {
    res.status(403).json({ message: "User already exists" });
  } else {
    const passCrypt = bcrypt.hashSync(password, salt);
    // we add user to database
    const data = addUser(name, email, passCrypt);
    const token = jwt.sign(
      { id: userId, email: email, pass: password },
      process.env.JWT_SECRET,
      {
        expiresIn: "20s",
      }
    );
    addToken(data[id], token);
    res.status(201).json({ token: token });
  }
});

app.get("/api/profile", (req, res) => {
  const token = req.headers.authorization;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json(payload);
  } catch (error) {
    res.status(401).json({ message: "Your token has expired." });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ message: "email, password is not declared" });
  }
  // we need to check whether user is already exist
  const results = users.find((user) => {
    return user.email == email && bcrypt.compareSync(password, user.pass);
  });
  console.log(results, "dddd");
  if (results) {
    const token = jwt.sign(
      { id: results.id, email: results.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "20s",
      }
    );
    console.log(token);
    res.status(201).json({ token: token });
  } else {
    res.status(401).json({ message: "Wrong prediction" });
  }
  // we add user to database
  // remember id of record
});

app.listen(2000, () => console.log("server is running"));
