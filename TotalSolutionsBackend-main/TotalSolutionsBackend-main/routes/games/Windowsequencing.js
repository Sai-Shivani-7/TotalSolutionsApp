const express = require('express');
const router = express.Router();
const WordSession = require('../../models/games/Windowsequencing');
  
  router.get('/word-sessions', async (req, res) => {
    try {
      const wordSessions = await WordSession.findOne(); // Fetch the single document containing all sessions
      if (!wordSessions || wordSessions.sessions.length === 0) {
        return res.status(404).send('No word sessions found.');
      }
      res.status(200).json(wordSessions.sessions); // Return the `sessions` array
    } catch (err) {
      console.error('Error fetching word sessions:', err);
      res.status(500).send('Error fetching word sessions: ' + err.message);
    }
  });
  
  module.exports = router;