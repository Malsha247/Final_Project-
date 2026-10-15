const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/chatbase-token", (req, res) => {
  // Example: user from session / auth middleware
  const user = req.user; // must exist

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = jwt.sign(
    {
      user_id: user.id,
      email: user.email,
    },
    process.env.CHATBOT_IDENTITY_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

module.exports = router;
