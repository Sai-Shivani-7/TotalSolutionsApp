const express = require("express");
const {section1,section2} = require('../../models/games/Sentenceverificationbridging');
const router = express.Router();

async function loadData() {
    try {
        const section = await section1.find();
        const section3 = await section2.find();
        return { "section-1": section, "section-2": section3 };
    } catch (err) {
        console.error("Failed to fetch data:", err);
        return { error: "Failed to load data" };
    }
}

router.get('/sections', async (req, res) => {
    const data = await loadData();
    res.json(data);
});

module.exports = router;