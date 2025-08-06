require("dotenv").config()
const app = require("./app")
const mongoose = require("mongoose")

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1) // Exit process with failure
  })
