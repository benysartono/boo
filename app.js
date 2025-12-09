const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// TEST route → shows server running
router.get("/", (req, res) => {
  res.send("Boo API running");
});

// GET profile by ID (or first profile)
router.get("/profile/:id?", async (req, res) => {
  try {
    let profile;

    if (req.params.id) {
      profile = await Profile.findById(req.params.id);
    } else {
      profile = await Profile.findOne();
    }

    if (!profile) return res.send("No profile found");

    res.render("profile_template", { profile });
  } catch (err) {
    console.error(err);
    res.send("Error loading profile");
  }
});

// Create profile
router.post("/profile", async (req, res) => {
  try {
    const { name, title, description } = req.body;

    const newProfile = new Profile({
      name,
      title,
      description,
      image: "/boo/static/default.jpg"
    });

    const saved = await newProfile.save();
    res.json({ success: true, id: saved._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Failed to create profile" });
  }
});

module.exports = router;
