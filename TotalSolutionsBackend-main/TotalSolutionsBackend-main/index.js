const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// const fs = require("fs");
// const path = require("path");
const { logger, httpLoggerAll } = require("./utils/logger");
const userRoutes = require("./routes/UserRoutes");
const dataRoutes = require("./routes/dataroutes");
const parentRoutes = require("./routes/parentRoutes");
const therapistRoutes = require("./routes/therapistRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const superadminRoutes = require("./routes/superadminRoutes");
const jwlRoutes = require("./routes/jwlRoutes");
const authRoutes = require("./routes/authRoutes");
const caseHistoryRoutes = require("./routes/caseHistoryRoutes");

const tablednd = require('./routes/games/tablednd');
const memorygame = require('./routes/games/memorygame');
const shadowmatching = require('./routes/games/shadowmatching');
const Sentenceverificationglobal = require('./routes/games/sentenceverificationglobal');
const dragandmatch = require('./routes/games/dragandmatch');
const connectingletters = require('./routes/games/connectingletters');
const Imagematching = require('./routes/games/imagematching');
const Sentenceverificationbridging = require('./routes/games/Sentenceverificationbridging');
const Windowsequencing = require('./routes/games/Windowsequencing');
const Animaljoining = require('./routes/games/Animaljoining');

const ReportRoutes = require("./routes/reportRoutes");
// const gameCapturesRoutes = require("./routes/gameCaptures");
require("dotenv").config();

const port = process.env.PORT || 4001;
const app = express();

// Logging middleware
app.use(httpLoggerAll);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('/home/totaluploads'));

const isDev = process.env.NODE_ENV === 'development';
const mongoURI = isDev
  ? process.env.MONGO_URI_DEV
  : process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.error('MongoDB connection error:', err));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/jwl", jwlRoutes);
app.use("/api/cases", caseHistoryRoutes);

app.use('/api/tablednd',tablednd);
app.use('/api/memorygame',memorygame);
app.use('/api/shadowmatching',shadowmatching);
app.use('/api/sentenceverificationglobal',Sentenceverificationglobal);
app.use('/api/dragandmatch',dragandmatch);
app.use('/api/connectingletters',connectingletters);
app.use('/api/imagematching',Imagematching);
app.use('/api/sentenceverificationbridging',Sentenceverificationbridging);
app.use('/api/windowsequencing',Windowsequencing);
app.use('/api/animaljoining',Animaljoining);
app.use("/api/reports", ReportRoutes);
// app.use("/api/codeofconduct", therapistRoutes);
// app.use("/api/gameCaptures", gameCapturesRoutes);

app.get("/api", (req, res) => {
  res.send("Hello from Total-B Server!");
});
// app.get("/api/get-test-video", (req, res) => {
//   const testVidPath = path.join(__dirname, "test_video.mp4");
//   res.sendFile(testVidPath);
// });
app.listen(port, () => {
  logger.info(`Server is running on port: ${port}`);
});