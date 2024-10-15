// src/routes.js
import express from "express";
// import { executeCode } from "./executor-docker.js";
import { executeCode } from "./executor.js";

const router = express.Router();

// POST route to handle code submissions
router.post("/execute", async (req, res) => {
  try {
    const { userId, language, files, ifRun, ifTest } = req.body;
    // console.log(
    //   "/execute req",
    //   JSON.stringify({ userId, language, files, ifRun, ifTest })
    // );

    if (!language || !files) {
      return res.status(400).json({ error: "Language and files" });
    }

    const result = await executeCode(userId, language, files, ifRun, ifTest);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred during code execution",
      details: error.message,
    });
  }
});

export default router;
