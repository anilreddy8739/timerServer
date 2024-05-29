const express = require("express");

const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  allowRequest: (req, callback) => {
    callback(null, true);
  },
  cors: {
    origin: [ "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const cors = require("cors");
app.use(cors());
app.use(express.json());

let timers = [];

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post("/api/timer", (req, res) => {
  const { endTime, title, timerColor = "rgba(179, 48, 102, 0.973)" } = req.body;

  if (!endTime || !title) {
    return res.json({ message: "End time and title are required" });
  }

  const newTimer = {
    id: Date.now(),
    endTime,
    title,
    timerColor,
  };

  timers.push(newTimer);
  io.emit("newTimer", newTimer); // Emit the newTimer event to all connected clients

  res.json({ message: "Timer created", timer: newTimer });
});

app.get("/api/timer", (req, res) => {
  if (timers.length === 0) {
    return res.json({ message: "No timers found" });
  }

  const latestTimer = timers[timers.length - 1];
  res.json({ latestTimer, timers });
});

app.post("/api/deletetimer", (req, res) => {
  const { id } = req.body;

  timers = timers.filter((timer) => timer.id !== id);
  io.emit("timerDeleted", id); // Emit the timerDeleted event to all connected clients

  res.json({ message: "Timer deleted successfully" });
});


const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});