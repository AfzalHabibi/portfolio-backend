require("dotenv").config({ path: "./.env" }) // Explicitly load .env for standalone script
const mongoose = require("mongoose")
const SiteSettings = require("../src/models/SiteSettings") // Adjust path if needed
const User = require("../src/models/User") // Adjust path if needed
const Skill = require("../src/models/Skill") // Added for Skills migration

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

    // --- Migration 2: Add 'isFeatured' field to Skills ---
    console.log("Running migration: Adding 'isFeatured' field to Skills...")
    const skillResult = await Skill.updateMany(
      { isFeatured: { $exists: false } }, // Find documents without this field
      { $set: { isFeatured: false } }, // Set default value to false
    )
    console.log(`Modified ${skillResult.modifiedCount} Skill documents.`)

    // --- Migration 3: Add 'isFeatured' field to Skill items ---
    console.log("Running migration: Adding 'isFeatured' field to Skill items...")
    const skillItemResult = await Skill.updateMany(
      { "items.isFeatured": { $exists: false } }, // Find documents with items missing this field
      { $set: { "items.$[].isFeatured": false } }, // Set default value to false for all items
    )
    console.log(`Modified ${skillItemResult.modifiedCount} Skill documents with item updates.`)

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
