require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = "mongodb+srv://dineshkm3644_db_user:<db_password>@cluster1.9wkxwkc.mongodb.net/";
const DB_NAME = process.env.DB_NAME || "laptop_inventory_db";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "laptops";

const client = new MongoClient(MONGO_URL);

async function startServer() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    app.use(express.json());
    app.use(express.static(path.join(__dirname)));

    app.get("/api/laptops", async (req, res) => {
      const laptops = await collection.find().toArray();
      res.json(laptops);
    });

    app.post("/api/laptops", async (req, res) => {
      const { laptop_brand, series, price } = req.body;
      if (!laptop_brand || !series || typeof price !== "number" || Number.isNaN(price)) {
        return res.status(400).json({ error: "Invalid laptop data" });
      }

      const result = await collection.insertOne({ laptop_brand, series, price });
      const inserted = await collection.findOne({ _id: result.insertedId });
      res.status(201).json(inserted);
    });

    app.delete("/api/laptops", async (req, res) => {
      await collection.deleteMany({});
      res.sendStatus(204);
    });

    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Connected to MongoDB at ${MONGO_URL}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
