const express = require('express');
const ShadowMatching = require('../../models/games/shadowmatching');
const router = express.Router();
router.get('/games', async (req, res) => {
    try {
        const games = await ShadowMatching.find({}, 'name _id');
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching games', error });
    }
});

router.get('/games/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const game = await ShadowMatching.findById(id);
        
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the game by ID', error });
    }
});
router.post('/games', async (req, res) => {
    const { name, items } = req.body;
    try {
        const newGame = new ShadowMatching({name,items});
        await newGame.save();
        res.status(201).json({
            message: 'Game created successfully',
            game: newGame
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating the game',
            error
        });
    }
});

module.exports = router;
