const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const recipes = require("./routes/recipes");
const users = require("./routes/users");
const auth = require("./routes/auth");
const port = 5000;

// connect to mongoDb with mongoose
const dbUrl = process.env.DATABASE_URL;
mongoose.connect(
  dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (error) {
    if (error) { 
      console.log("Error!" + error);
    } else {
      console.log("Connencted to db");
    }
  }
);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/recipes", recipes);
app.use("/users", users);
app.use("/auth", auth);

app.get("/", (req, res) => {
  res.send("Cook.Eat");
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
