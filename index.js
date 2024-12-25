import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

let sql;
if (process.env.NEON_DATABASE_URL) {
  sql = neon(process.env.NEON_DATABASE_URL);
  console.log("Neon database connected!");
} else {
  console.log("No Neon database URL found in environment variables.");
}

async function getUser(email) {
  try {
    const data = await sql(
      `SELECT name, email FROM accounts WHERE email = ${email}`
    );
    return data[0];
  } catch (error) {
    return false;
  }
}

async function addUser(name, email, pass) {
  try {
    const data = await sql(
      `INSERT INTO accounts(name, email, pass) VALUES($1, $2, $3) RETURNING *`,
      [name, email, pass]
    );
    console.log("Inserted user:", data);
    return data[0];
  } catch (error) {
    console.error("Error adding user:", error);
    return false;
  }
}

async function logUser(email) {
  try {
    const data = await sql(
      `SELECT id, name, email, pass FROM accounts WHERE email = $1`,
      [email]
    );
    return data[0];
  } catch (error) {
    console.error("Error logging in user:", error);
    return false;
  }
}

const app = express();
app.use(express.json());
app.use(cors());
const salt = bcrypt.genSaltSync(2);

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await getUser(email);
    if (existingUser) {
      return res.status(403).json({ message: "User already exists" });
    }

    const passCrypt = bcrypt.hashSync(password, salt);
    const newUser = await addUser(name, email, passCrypt);
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "20s" }
    );
    res.status(201).json({ token });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/api/profile", async (req, res) => {
  const token = req.headers.authorization;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await getUser(payload.email);
    if (userData) {
      res.status(200).json(userData);
    } else {
      res.status(400);
    }
  } catch (error) {
    res.status(401).json({ message: "Your token has expired." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ message: "email, password is not declared" });
  }

  const result = await logUser(email);
  if (result && bcrypt.compareSync(password, result.pass)) {
    const token = jwt.sign(
      { id: result.id, email: result.email },
      process.env.JWT_SECRET,
      { expiresIn: "20s" }
    );
    res.status(201).json({ token: token });
  } else {
    res.status(401).json({ message: "Wrong email or password" });
  }
});

app.listen(2000, () => console.log("server is running"));

