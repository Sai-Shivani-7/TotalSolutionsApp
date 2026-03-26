const express = require('express');
const ConnectingLetter = require('../../models/games/Connectingletters');
const router = express.Router();

router.get('/:level/:item', async (req, res) => {
    const { level, item } = req.params;
    console.log(level, item);
    try {
        const data =  await ConnectingLetter.findOne({level, item});
        res.json(data.content);
    } catch (error) {
        res.status(404).send('Data not found');
    }
    
});
router.post('/', async (req, res) => {
    const { level, item, content } = req.body;
    const newContent = new ConnectingLetter({level, item, content});
    try {
        await newContent.save();
        res.send('Data inserted successfully');
    } catch (error) {
        res.status(404).send('Data not inserted');
    }
});

module.exports = router;