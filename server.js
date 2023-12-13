const express = require("express");
require("dotenv").config();
const app = express();

const http = require("http").createServer(app);

const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");
const fs = require("fs");

const expressFormidable = require("express-formidable");

app.use(expressFormidable());

app.set("view engine", "ejs");

const port = process.env.PORT || 3000;

const users = [];

http.listen(port, () => {
  console.log(`Server started at ${port}`);

  app.post("/protected", verifyToken, (req, res, next) => {
    res.status(200).json({
      user: req.userData,
    });
  });

  app.post("/verify", (req, res) => {
    const email = req.fields.email;
    const hash = parseInt(req.fields.hash);
    const now = new Date().getTime();

    const user = users.find(
      (u) => u.email === email && u.hash === hash && u.expiresIn > now
    );
    if (user === undefined) {
      res.send("Not logged in.");
      return;
    }

    res.json({
      refreshToken: generateToken(email),
    });
  });

  app.post("/login", async (req, res) => {
    const email = req.fields.email;
    const hash = Math.floor(100000 + Math.random() * 900000);

    const user = users.find((u) => u.email === email);

    const expiresIn = new Date().getTime() + 30 * 1000;

    if (user === undefined) {
      users.push({
        email,
        hash,
        expiresIn, //seconds
      });
      console.log("New user:" + email);
    } else {
      console.log("Existing:" + email);
      user.hash = hash;
      user.expiresIn = expiresIn; //seconds
    }

    console.log(users);

    res.render("verification", {
      email,
    });

    await sendEmailVerification(hash, email);
  });

  app.get("/", (req, res) => {
    res.render("index");
  });
});

async function sendEmailVerification(hash, to) {
  const fromEmail = process.env.MAILER_FROM_EMAIL;
  const name = process.env.MAILER_FROM_NAME;
  const transport = nodemailer.createTransport({
    host: "smtp.flostage.com",
    port: 465,
    secure: true,
    auth: { user: fromEmail, pass: process.env.MAILER_FROM_PASS },
  });

  const emailObject = await transport.sendMail({
    from: `${name} <${fromEmail}>`,
    to,
    subject: "Verification",
    text: `Your verification code is ${hash}`,
    html: `Your verification code is <b>${hash}</b>`,
  });

  console.log(emailObject);
}

function generateToken(email) {
  const privateKey = fs.readFileSync("jwt_private.key"); //Generate key pair https://github.com/vochinguyen/nodejs_crypto_basic_231206
  const token = jwt.sign({ email }, privateKey, {
    algorithm: "RS256",
    expiresIn: "5m",
  });

  return token;
}

function verifyToken(req, res, next) {
  try {
    const bearerToken = req.headers.authorization;
    const token = bearerToken.split(" ")[1];
    const publicKey = fs.readFileSync("jwt_public.key"); //Generate key pair https://github.com/vochinguyen/nodejs_crypto_basic_231206
    const decoded = jwt.verify(token, publicKey);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed",
    });
  }
}
