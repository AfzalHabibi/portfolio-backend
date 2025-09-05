const Skill = require("../models/Skill")

// @desc    Create a single skill (auto-creates category if needed)
// @route   POST /api/skills/direct
// @access  Private (Admin/Authenticated User)
exports.createSkillDirect = async (req, res) => {
  try {
    const {
      name,
      category,
      keywords = [],
      proficiency,
      experience,
      description,
      projects = [],
      certifications = [],
      tools_used = [],
      best_practices = [],
      achievements = [],
      version,
      methodologies = [],
      performance_metrics = [],
      used_in_roles = [],
      difficulty_handled,
      endorsements = [],
      icon,
      color
    } = req.body

    // Validate required fields
    if (!name || !category || !proficiency || !experience || !description) {
      return res.status(400).json({ 
        message: "Name, category, proficiency, experience, and description are required" 
      })
    }

    // Find or create category
    let skillCategory = await Skill.findOne({ category: category.trim() })
    
    if (!skillCategory) {
      // Create new category
      skillCategory = new Skill({
        category: category.trim(),
        description: `${category.trim()} related skills`,
        icon: icon || 'fas fa-code',
        color: color || '#0ea5e9',
        items: []
      })
    }

    // Check if skill already exists in this category
    const existingSkill = skillCategory.items.find(item => 
      item.name.toLowerCase() === name.trim().toLowerCase()
    )
    
    if (existingSkill) {
      return res.status(400).json({ 
        message: `Skill "${name}" already exists in category "${category}"` 
      })
    }

    // Create new skill item
    const newSkillItem = {
      name: name.trim(),
      keywords: keywords.filter(k => k.trim()),
      proficiency: proficiency.trim(),
      experience: experience.trim(),
      description: description.trim(),
      projects: projects.filter(p => p.trim()),
      certifications: certifications.filter(c => c.trim()),
      tools_used: tools_used.filter(t => t.trim()),
      best_practices: best_practices.filter(b => b.trim()),
      achievements: achievements.filter(a => a.trim()),
      version: version?.trim(),
      methodologies: methodologies.filter(m => m.trim()),
      performance_metrics: performance_metrics.filter(p => p.trim()),
      used_in_roles: used_in_roles.filter(r => r.trim()),
      difficulty_handled: difficulty_handled?.trim(),
      endorsements: endorsements.filter(e => e.trim()),
      icon: icon?.trim(),
      color: color?.trim() || '#0ea5e9',
      isActive: true,
      displayOrder: skillCategory.items.length
    }

    // Add skill to category
    skillCategory.items.push(newSkillItem)
    await skillCategory.save()

    res.status(201).json({ 
      message: "Skill created successfully", 
      skill: skillCategory,
      newSkill: newSkillItem
    })
  } catch (error) {
    console.error("Error creating skill:", error)
    res.status(500).json({ message: "Server error creating skill", error: error.message })
  }
}

// @desc    Create a new skill category with items
// @route   POST /api/skills
// @access  Private (Admin/Authenticated User)
exports.createSkill = async (req, res) => {
  try {
    const { category, description, icon, color, items = [] } = req.body

    // Check if category already exists
    const existingSkill = await Skill.findOne({ category: category.trim() })
    if (existingSkill) {
      return res.status(400).json({ message: "Skill category already exists" })
    }

    // Validate skill items
    if (items.length > 0) {
      for (const item of items) {
        if (!item.name || !item.proficiency || !item.experience || !item.description) {
          return res.status(400).json({ 
            message: "Each skill item must have name, proficiency, experience, and description" 
          })
        }
      }
    }

    const skill = new Skill({
      category: category.trim(),
      description: description?.trim(),
      icon: icon?.trim(),
      color: color?.trim() || "#0ea5e9",
      items: items.map((item, index) => ({
        ...item,
        displayOrder: item.displayOrder || index
      }))
    })

    await skill.save()
    res.status(201).json({ message: "Skill category created successfully", skill })
  } catch (error) {
    console.error("Error creating skill:", error)
    res.status(500).json({ message: "Server error creating skill", error: error.message })
  }
}

// @desc    Get all skills with items
// @route   GET /api/skills
// @access  Public
exports.getAllSkills = async (req, res) => {
  try {
    const { includeInactive = false } = req.query
    
    const filter = includeInactive === 'true' ? {} : { isActive: true }
    
    const skills = await Skill.find(filter)
      .sort({ displayOrder: 1, category: 1 })
      .lean()

    // Sort items within each category
    skills.forEach(skill => {
      if (skill.items && skill.items.length > 0) {
        skill.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        // Filter active items for public access
        if (includeInactive !== 'true') {
          skill.items = skill.items.filter(item => item.isActive !== false)
        }
      }
    })

    res.status(200).json(skills)
  } catch (error) {
    console.error("Error fetching skills:", error)
    res.status(500).json({ message: "Server error fetching skills", error: error.message })
  }
}

// @desc    Get single skill category by ID
// @route   GET /api/skills/:id
// @access  Public
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
    if (!skill) {
      return res.status(404).json({ message: "Skill category not found" })
    }
    
    // Sort items by display order
    if (skill.items && skill.items.length > 0) {
      skill.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    }
    
    res.status(200).json(skill)
  } catch (error) {
    console.error("Error fetching skill by ID:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid skill ID format" })
    }
    res.status(500).json({ message: "Server error fetching skill", error: error.message })
  }
}

// @desc    Update a skill category by ID
// @route   PUT /api/skills/:id
// @access  Private (Admin/Authenticated User)
exports.updateSkill = async (req, res) => {
  try {
    const { category, description, icon, color, items } = req.body

    const updateData = {}
    if (category) updateData.category = category.trim()
    if (description !== undefined) updateData.description = description?.trim()
    if (icon !== undefined) updateData.icon = icon?.trim()
    if (color !== undefined) updateData.color = color?.trim()
    if (items !== undefined) {
      // Validate skill items
      for (const item of items) {
        if (!item.name || !item.proficiency || !item.experience || !item.description) {
          return res.status(400).json({ 
            message: "Each skill item must have name, proficiency, experience, and description" 
          })
        }
      }
      updateData.items = items.map((item, index) => ({
        ...item,
        displayOrder: item.displayOrder !== undefined ? item.displayOrder : index
      }))
    }

    const skill = await Skill.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      {
        new: true,
        runValidators: true,
      }
    )

    if (!skill) {
      return res.status(404).json({ message: "Skill category not found" })
    }

    res.status(200).json({ message: "Skill category updated successfully", skill })
  } catch (error) {
    console.error("Error updating skill:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid skill ID format" })
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Skill category already exists" })
    }
    res.status(500).json({ message: "Server error updating skill", error: error.message })
  }
}

// @desc    Add skill item to category
// @route   POST /api/skills/:id/items
// @access  Private (Admin/Authenticated User)
exports.addSkillItem = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
    if (!skill) {
      return res.status(404).json({ message: "Skill category not found" })
    }

    const { name, proficiency, experience, description } = req.body
    if (!name || !proficiency || !experience || !description) {
      return res.status(400).json({ 
        message: "Name, proficiency, experience, and description are required" 
      })
    }

    const newItem = {
      ...req.body,
      displayOrder: req.body.displayOrder || skill.items.length
    }

    skill.items.push(newItem)
    await skill.save()

    res.status(201).json({ 
      message: "Skill item added successfully", 
      skill,
      addedItem: skill.items[skill.items.length - 1]
    })
  } catch (error) {
    console.error("Error adding skill item:", error)
    res.status(500).json({ message: "Server error adding skill item", error: error.message })
  }
}

// @desc    Update skill item
// @route   PUT /api/skills/:id/items/:itemId
// @access  Private (Admin/Authenticated User)
exports.updateSkillItem = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
    if (!skill) {
      return res.status(404).json({ message: "Skill category not found" })
    }

    const item = skill.items.id(req.params.itemId)
    if (!item) {
      return res.status(404).json({ message: "Skill item not found" })
    }

    // Update item fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key]
      }
    })

    await skill.save()

    res.status(200).json({ 
      message: "Skill item updated successfully", 
      skill,
      updatedItem: item
    })
  } catch (error) {
    console.error("Error updating skill item:", error)
    res.status(500).json({ message: "Server error updating skill item", error: error.message })
  }
}

// @desc    Delete skill item
// @route   DELETE /api/skills/:id/items/:itemId
// @access  Private (Admin/Authenticated User)
exports.deleteSkillItem = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
    if (!skill) {
      return res.status(404).json({ message: "Skill category not found" })
    }

    const item = skill.items.id(req.params.itemId)
    if (!item) {
      return res.status(404).json({ message: "Skill item not found" })
    }

    skill.items.pull(req.params.itemId)
    await skill.save()

    res.status(200).json({ message: "Skill item deleted successfully", skill })
  } catch (error) {
    console.error("Error deleting skill item:", error)
    res.status(500).json({ message: "Server error deleting skill item", error: error.message })
  }
}

// @desc    Delete a skill category by ID
// @route   DELETE /api/skills/:id
// @access  Private (Admin/Authenticated User)
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id)
    if (!skill) {
      return res.status(404).json({ message: "Skill category not found" })
    }
    res.status(200).json({ message: "Skill category deleted successfully" })
  } catch (error) {
    console.error("Error deleting skill:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid skill ID format" })
    }
    res.status(500).json({ message: "Server error deleting skill", error: error.message })
  }
}

// @desc    Update skill categories display order
// @route   PUT /api/skills/reorder
// @access  Private (Admin/Authenticated User)
exports.reorderSkills = async (req, res) => {
  try {
    const { skillOrders } = req.body // Array of { id, displayOrder }
    
    if (!Array.isArray(skillOrders)) {
      return res.status(400).json({ message: "skillOrders must be an array" })
    }

    const updatePromises = skillOrders.map(({ id, displayOrder }) =>
      Skill.findByIdAndUpdate(id, { displayOrder }, { new: true })
    )

    await Promise.all(updatePromises)

    const updatedSkills = await Skill.find().sort({ displayOrder: 1, category: 1 })
    res.status(200).json({ 
      message: "Skills reordered successfully", 
      skills: updatedSkills 
    })
  } catch (error) {
    console.error("Error reordering skills:", error)
    res.status(500).json({ message: "Server error reordering skills", error: error.message })
  }
}
