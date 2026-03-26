const express = require('express');
const router = express.Router();
const MemoryGame = require('../../models/games/memorygame.js');

router.get('/getGameData/:gameId', async (req, res) => {
    try {
        const gameData = await MemoryGame.findOne();
        const words = Array.from(gameData.words.entries()).slice(0, 5).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});

        res.status(200).send({ ...gameData._doc, words });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;