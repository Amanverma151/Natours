const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

// b253a6fcf279b19b6c1fdab37cccc138

// Creating email class so that we can then create email objects for send the actual emails to the user.
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.firstName = user.firstName;
    this.from = `Aman Verma <${process.env.EMAIL_FROM}>`;
  }

  // Function to create a transporter
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // SendGrid
      return nodemailer.createTransport({
        service: "mailjet",
        auth: {
          user: process.env.MAILJET_USER,
          pass: process.env.MAILJET_PASSWORD,
        },
      });
    }
    // else
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Function for sending the actual email
  async send(template, subject) {
    // 1. Rendering the HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2. Define email options options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3. Create a transporter and send the email
    await this.newTransport().sendMail(mailOptions);
  }

  // Welcome function
  async sendWelcome() {
    await this.send("welcome", "Welcome to the natours family!"); // using "this" because these methods are defined on the current object
  }

  async sendPasswordReset() {
    await this.send(
      "resetPassword",
      "Your password reset token(valid for only 10 min)"
    );
  }
};
