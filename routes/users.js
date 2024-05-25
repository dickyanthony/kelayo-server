import e from "express";
const router = e.Router();

router.get("/", (req, res) => {
  console.log("tes");
  res.render("index", { text: "testing" });
});

router.get("/new", (req, res) => {
  res.send("User New Form");
});

export default router;
