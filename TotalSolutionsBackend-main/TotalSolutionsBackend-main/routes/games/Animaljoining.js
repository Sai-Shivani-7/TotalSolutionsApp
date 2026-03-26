const mongoose = require('mongoose');
const Segment = require('../../models/games/Animaljoining');
const express = require('express');
const router = express.Router();

router.get("/segment/:sessionId/:levelId",async(req,res)=>{
    try {
        const {sessionId, levelId} = req.params;
        const segment = await Segment.findOne({levelId:levelId,sessionId:sessionId});
        if(!segment){
            res.status(404).json({message:"Not Found"});
        }
        res.status(200).json(segment);
    } catch (error) {
        res.status(400).json({message:"Bad request"});
    }
});

module.exports = router;