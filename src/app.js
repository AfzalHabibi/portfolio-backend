const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const siteSettingsRoutes = require("./routes/siteSettings")
const projectRoutes = require("./routes/projectRoutes")
const skillRoutes = require("./routes/skillRoutes")
const testimonialRoutes = require("./routes/testimonialRoutes")

const app = express()

// Middleware
app.use(cors()) // Enable CORS for all origins (adjust for production)
app.use(express.json()) // Parse JSON request bodies

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/site-settings", siteSettingsRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/skills", skillRoutes)
app.use("/api/testimonials", testimonialRoutes)

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Portfolio Backend API is running!")
})

module.exports = app
