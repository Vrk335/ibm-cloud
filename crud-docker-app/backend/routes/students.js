const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// Create
router.post("/students", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    if (!name || !email || typeof age !== "number") {
      return res.status(400).json({ message: "name, email, and age are required" });
    }

    const student = await Student.create({ name, email, age });
    return res.status(201).json(student);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "email already exists" });
    }
    return res.status(500).json({ message: "failed to create student" });
  }
});

// Read all
router.get("/students", async (_req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.json(students);
  } catch (_err) {
    return res.status(500).json({ message: "failed to fetch students" });
  }
});

// Read one
router.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "student not found" });
    return res.json(student);
  } catch (_err) {
    return res.status(404).json({ message: "student not found" });
  }
});

// Update
router.put("/students/:id", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    if (!name || !email || typeof age !== "number") {
      return res.status(400).json({ message: "name, email, and age are required" });
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, age },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "student not found" });
    return res.json(updated);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "email already exists" });
    }
    return res.status(500).json({ message: "failed to update student" });
  }
});

// Delete
router.delete("/students/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "student not found" });
    return res.json({ message: "deleted" });
  } catch (_err) {
    return res.status(404).json({ message: "student not found" });
  }
});

module.exports = router;