const express = require('express');
const router = express.Router();
const Data = require('../../models/games/tabledraganddrop.js');

// POST route to add new data
router.post('/data', async (req, res) => {
    try {
        const { name, data } = req.body;

        const newData = new Data({
            name,
            data
        });

        const savedData = await newData.save();
        res.status(201).json({ message: 'Data created successfully',result: savedData });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while saving the data', details: error.message });
    }
});
router.get('/data', async (req, res) => {
    try {
        const entries = await Data.find({}, { name: 1 }); 
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the data', details: error.message });
    }
});

// GET route to get data based on ID
router.get('/data/:id', async (req, res) => {
    console.log(req.params)
    try {
        const { id } = req.params;
        const data = await Data.findById(id);
        
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the data', details: error.message });
    }
});

module.exports = router;
