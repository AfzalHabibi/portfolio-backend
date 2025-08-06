require("dotenv").config({ path: "./.env" }) // Explicitly load .env for standalone script
const mongoose = require("mongoose")
const User = require("../src/models/User")
const SiteSettings = require("../src/models/SiteSettings")
const Project = require("../src/models/Project") // New import

const MONGO_URI = process.env.MONGO_URI

async function runSeeder() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in .env file.")
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log("MongoDB connected for seeding.")

    // --- Seed Admin User ---
    console.log("Seeding admin user...")
    const adminEmail = "admin@example.com"
    let adminUser = await User.findOne({ email: adminEmail })

    if (!adminUser) {
      adminUser = new User({
        email: adminEmail,
        password: "adminpassword123", // IMPORTANT: Change this in production!
      })
      await adminUser.save()
      console.log(`Admin user '${adminEmail}' created.`)
    } else {
      console.log(`Admin user '${adminEmail}' already exists. Skipping.`)
    }

    // --- Seed Site Settings ---
    console.log("Seeding default site settings...")
    let siteSettings = await SiteSettings.findOne()

    if (!siteSettings) {
      siteSettings = new SiteSettings({
        name: "Your Portfolio",
        title: "Full Stack Developer",
        description: "A passionate developer showcasing projects and skills.",
        email: "contact@yourportfolio.com",
        phone: "+1234567890",
        location: "New York, USA",
        socialLinks: {
          linkedin: "https://linkedin.com/in/yourprofile",
          github: "https://github.com/yourusername",
          twitter: "https://twitter.com/yourhandle",
          instagram: "",
          behance: "",
          dribbble: "",
        },
        cvUrl: "https://yourportfolio.com/your-cv.pdf",
      })
      await siteSettings.save()
      console.log("Default site settings created.")
    } else {
      console.log("Site settings already exist. Skipping.")
    }

    // --- Seed Projects ---
    console.log("Seeding sample projects...")
    const projectCount = await Project.countDocuments()
    if (projectCount === 0) {
      const sampleProjects = [
        {
          title: "E-commerce Platform",
          description: "A full-stack e-commerce application.",
          longDescription:
            "Developed a robust e-commerce platform with user authentication, product catalog, shopping cart, and order processing. Integrated Stripe for payments.",
          features: ["User authentication", "Product browsing", "Shopping cart", "Payment gateway", "Admin dashboard"],
          technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe API", "Redux"],
          images: ["/images/ecommerce-main.jpg", "/images/ecommerce-product.jpg"],
          mainImage: "/images/ecommerce-main.jpg",
          demoUrl: "https://demo.ecommerce.com",
          githubUrl: "https://github.com/yourusername/ecommerce-platform",
          category: "Web Development",
          completedDate: "October 2023",
        },
        {
          title: "Portfolio Website V2",
          description: "My personal portfolio website showcasing projects and skills.",
          longDescription:
            "Designed and developed a responsive and modern portfolio website to highlight my work, experience, and contact information. Features a dynamic project section.",
          features: ["Responsive design", "Dynamic project loading", "Contact form", "Blog section"],
          technologies: ["Next.js", "Tailwind CSS", "TypeScript", "MongoDB", "Vercel"],
          images: ["/images/portfolio-v2-main.jpg", "/images/portfolio-v2-projects.jpg"],
          mainImage: "/images/portfolio-v2-main.jpg",
          demoUrl: "https://yourportfolio.com",
          githubUrl: "https://github.com/yourusername/portfolio-v2",
          category: "Personal Project",
          completedDate: "January 2024",
        },
      ]
      await Project.insertMany(sampleProjects)
      console.log(`${sampleProjects.length} sample projects created.`)
    } else {
      console.log(`${projectCount} projects already exist. Skipping seeding projects.`)
    }

    console.log("Seeding completed successfully.")
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log("MongoDB disconnected.")
  }
}

runSeeder()
