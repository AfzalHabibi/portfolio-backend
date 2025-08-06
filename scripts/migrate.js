require("dotenv").config({ path: "./.env" }) // Explicitly load .env for standalone script
const mongoose = require("mongoose")
const SiteSettings = require("../src/models/SiteSettings") // Adjust path if needed
const User = require("../src/models/User") // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI

async function runMigrations() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in .env file.")
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log("MongoDB connected for migrations.")

    // --- Migration 1: Add 'lastUpdatedBy' field to SiteSettings (example) ---
    console.log("Running migration: Adding 'lastUpdatedBy' to SiteSettings...")
    const result = await SiteSettings.updateMany(
      { lastUpdatedBy: { $exists: false } }, // Find documents without this field
      { $set: { lastUpdatedBy: "migration_script" } }, // Set a default value
    )
    console.log(`Modified ${result.modifiedCount} SiteSettings documents.`)

    // --- Add more migrations here as needed ---
    // Example: Rename a field
    // console.log("Running migration: Renaming 'oldField' to 'newField' in someCollection...")
    // await SomeModel.updateMany({}, { $rename: { "oldField": "newField" } });
    // console.log("Field renamed.")

    console.log("All migrations completed successfully.")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log("MongoDB disconnected.")
  }
}

runMigrations()
