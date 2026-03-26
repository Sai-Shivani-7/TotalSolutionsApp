router.get("/gamedetails/:gameid", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Access Denied");
    const centredetails = await Centre.findOne({ centreid : req.user._id });
    const centre = centredetails.centreId;
    const gamer = req.params.gameid;
    try {
      const games = await Game.find({ gameId: gamer });
      fetchchildId = games.map((game) => game.childId);
      const children = await Child.find({ _id: fetchchildId, centreId: centre });
      res.send(children);
    } catch (err) {
      res.status(400).send(err);
    }
  });


  router.get("/gametable/:childId", auth, async (req, res) => {
    const childId = req.params.childId;
    try {
      const games = await Game.find({ childId: childId });
      res.send(games);
    } catch (err) {
      res.status(400).send(err);
    }
  });


  

