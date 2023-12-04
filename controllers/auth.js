const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  createJWT,
} = require("../utils/auth");
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const nodemailer = require('nodemailer'); // Add nodemailer package

exports.signup = (req, res, next) => {
  console.log(req.body);
  let { name, email } = req.body;
  let errors = [];

  if (!name) {
    errors.push({ name: "required" });
  }
  if (!email) {
    errors.push({ email: "required" });
  }
  if (!emailRegexp.test(email)) {
    errors.push({ email: "invalid" });
  }
  if (errors.length > 0) {
    return res.status(422).json({ errors: errors });
  }

  // Generate a random password
  const randomPassword = generateRandomPassword();

  User.findOne({ email: email })
    .then(user => {
      if (user) {
        return res.status(422).json({ errors: [{ user: "email already exists" }] });
      } else {
        const user = new User({
          name: name,
          email: email,
          password: randomPassword,
        });

        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(randomPassword, salt, function (err, hash) {
            if (err) throw err;
            user.password = hash;

            user.save()
              .then(response => {
                // Send email with credentials
                sendEmail(email, randomPassword);

                res.status(200).json({
                  success: true,
                  result: response
                });
              })
              .catch(err => {
                res.status(500).json({
                  errors: [{ error: err }]
                });
              });
          });
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        errors: [{ error: 'Something went wrong' }]
      });
    });
};

// Function to generate a random password
function generateRandomPassword() {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
}

// Function to send email with credentials
function sendEmail(email, password) {
  // Use nodemailer to send an email with the generated credentials
  // Replace the placeholder values with your email server details
  let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'bilawal@wetrackads.com', // generated ethereal user
            pass: "bbgdktfnkeyeywpq", // generated ethereal password
        },
        tls: {
          ciphers:'SSLv3'
      }
    });

  const mailOptions = {
    from: 'bilawal@wetrackads.com',
    to: email,
    subject: 'Your Track-Down Credentials',
    text: `Hello,\n\nWelcome to Track-Down. Here are your login credentials:\n\nEmail: ${email}\nPassword: ${password}\Login Url: https://my-trk.vercel.app/\n\nPlease keep this information secure.`
  };

  transporter.sendMail(mailOptions)
  .then((info) => {
    console.log("Email sent successfully");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  })
  .catch(error => {
    console.error("Error sending email:", error);
  });
}

exports.signin = (req, res) => {
    console.log("Till Now Working Fine 0101");
    let { email, password } = req.body;
    let errors = [];

    if (!email) {
        errors.push({ email: "required" });
    } else if (!emailRegexp.test(email)) {
        errors.push({ email: "invalid email" });
    }

    if (!password) {
        errors.push({ password: "required" });
    }

    if (errors.length > 0) {
        console.log("Till Now Working Fine 01");
        return res.status(422).json({ errors: errors });
    }

    User.findOne({ email: email }).then(user => {
        if (!user) {
            return res.status(404).json({
                errors: [{ user: "not found" }],
            });
        }

        bcrypt.compare(password, user.password).then(isMatch => {
            if (!isMatch) {
                return res.status(400).json({ errors: [{ password: "incorrect" }] });
            }

            let access_token = createJWT(
                user.email,
                user._id,
                86400
            );

            console.log("Till Now Working Fine");

            jwt.verify(access_token, process.env.TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    console.log("Till Now Working Fine 0102");
                    return res.status(500).json({ errors: err });
                }

                if (decoded) {
                    const { _id, name, email } = user;
                    return res.status(200).json({
                        success: true,
                        user: { _id, name, email },
                        accessToken: access_token
                    });
                }
            });
        }).catch(err => {
            console.error("Error during sign-in:", err);
            res.status(500).json({ errors: err.message });
        });
    }).catch(err => {
        console.log("Till Now Working Fine 0104");
        res.status(500).json({ errors: err });
    });
}
