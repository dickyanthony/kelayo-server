import e from "express";
import userRouter from "./routes/users.js";
const app = e();

app.use(logger);
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  console.log("tes");
  res.render("index", { text: "testing" });
});

app.use("/users", userRouter);

function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

app.listen(3000);
