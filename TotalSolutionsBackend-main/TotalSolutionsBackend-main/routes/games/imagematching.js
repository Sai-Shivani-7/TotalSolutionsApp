const express = require("express");
const imageMatching = require('../../models/games/Imagematching');
const router = express.Router();
router.post('/games', async(req,res)=>{
    const {name, items} = req.body;
    try{
        const newGame = new imageMatching({name,items});
        await newGame.save();
        res.status(201).json({
            message:'Game created successfully',
            game:newGame
        });
    } catch(error) {
        res.status(500).json({
            message:'Error creating the game', error
        });
    }
});
router.get('/games', async (req,res)=>{
    try{
        const games = await imageMatching.find();
        res.status(200).json(games);
    }catch(error){
        res.status(500).json({message:'Error fetching the game', error});
    }
});
router.get('/games/:id', async (req,res)=>{
    const {id} = req.params;
    try{
        const games = await imageMatching.findById(id);
        res.status(200).json(games);
    }catch(error){
        res.status(500).json({message:'Error fetching the game', error});
    }
});
module.exports = router;