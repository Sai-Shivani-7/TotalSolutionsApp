const express = require('express');
const Sentenceverificationglobal = require('../../models/games/Sentenceverificationglobal');
const router = express.Router();

router.get('/game-data', async (req, res) => {
    try {
      const gameData = await Sentenceverificationglobal.find(); // Retrieve all game data from MongoDB
      res.json(gameData); // Send the game data back as JSON
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch game data' });
    }
  });
  
  // Sample route to add game data
  router.post('/game-data', async (req, res) => {
    const newGameData = new Sentenceverificationglobal(req.body);
    try {
      await newGameData.save(); // Save new game data to MongoDB
      res.json({ message: 'Game data saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save game data' });
    }
  });

  module.exports = router;