const mongoose = require("mongoose");

const SegmentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ["animal", "shadow", "segment"] },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  src: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }, // Optional field
});

const GameSchema = new mongoose.Schema({
  levelId: { type: Number, required: true },
  sessionId:{type:Number , required:true },
  segments: { type: [SegmentSchema], required: true },
  correctSegment: { type: String, required: true },
});
GameSchema.index({ sessionId: 1, levelId: 1 }, { unique: true });

const Segment = mongoose.model("Animaljoining", GameSchema);
module.exports = Segment;