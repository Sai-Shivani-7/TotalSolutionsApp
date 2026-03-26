const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  name: { type: String, required: true },
  img: { type: String, required: true },
  description: { type: String, required: true },
  route: { type: String, required: true },
  status : { type: String, required: true, enum : ["active", "inactive"], default: "active" },
});

const groupSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  games: [gameSchema],
},{timestamps: true});

module.exports = mongoose.model("GamesHome", groupSchema);
