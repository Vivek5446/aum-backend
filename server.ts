const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your email and MongoDB URI
const OWNER_EMAIL = "uknownwarrior04@gmail.com";
const MONGO_URI = "mongodb+srv://mrityunjaygupta-aum:QaVH8R0ksCH2hNmH@aum-yoga-prod-01.ch2wcja.mongodb.net/userInfo";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err:any) => console.error("MongoDB connection error:", err));

const contactSchema = new mongoose.Schema({
  fullName: String,
  country: String,
  phone: String,
  email: String,
  message: String,
  jobTitle: String,
  employeesCount: String,
  companyName: String,
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: OWNER_EMAIL,
    pass: "feyo tayu llhq wobv", // App password
  },
});

app.post("/send-email", async (req:any, res:any) => {
  const { fullName, country, phone, email, message, jobTitle, employeesCount, companyName } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({
      message: "Validation failed",
      error: "Full Name, Email, and Message are required fields",
    });
  }

  try {
    await transporter.sendMail({
      from: OWNER_EMAIL,
      to: OWNER_EMAIL,
      subject: `New Contact Form Submission from ${fullName}`,
      text: `
        Full Name: ${fullName}
        Email: ${email}
        Phone: ${phone || "N/A"}
        Country: ${country || "N/A"}
        Job Title: ${jobTitle || "N/A"}
        Employees Count: ${employeesCount || "N/A"}
        Company Name: ${companyName || "N/A"}
        Message: ${message}
      `,
    });

    await transporter.sendMail({
      from: OWNER_EMAIL,
      to: email,
      subject: "Thank You for Contacting Us!",
      text: `Hi ${fullName},\n\nThank you for reaching out. We have received your message and will get back to you soon.\n\nYour Message:\n${message}\n\n- Team`,
    });

    const contact = new Contact({
      fullName,
      country,
      phone,
      email,
      message,
      jobTitle,
      employeesCount,
      companyName,
    });
    await contact.save();

    res.json({ message: "Emails sent and data stored successfully!" });
  } catch (error:any) {
    console.error("Error processing request:", error);
    res.status(500).json({
      message: "Request failed",
      error: error.message || error,
    });
  }
});

module.exports = app;
