const mongoose = require("mongoose")

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    avatar: { type: String, trim: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Testimonial", TestimonialSchema)
