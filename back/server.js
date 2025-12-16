import express from "express";
import dotenv from "dotenv";
import parseRoute from "./routes/parse.js";
import cors from "cors";

dotenv.config();

const app = express();

const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = clientUrl ? [clientUrl] : ["http://localhost:3000"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", parseRoute);

app.get("/", (req, res) => {
  res.send("IntelliForm API running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
