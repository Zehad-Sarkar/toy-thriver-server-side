const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7em2cfy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toyCollection = client.db("toysCollectionDB").collection("toys");

    const teddyBearCollection = client
      .db("toysCollectionDB")
      .collection("teddyBear");

    const dinosaurCollection = client
      .db("toysCollectionDB")
      .collection("dinosaur");

    const catCollection = client.db("toysCollectionDB").collection("cat");

    // get my toys from database

    app.get("/mytoys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      let sortOrder = req.query?.sortOrder === "ascending" ? 1 : -1;
      const result = await toyCollection
        .find(query)
        .sort({ price: sortOrder })
        .toArray();
      let sliceData = result;
      if (result.length > 20) {
        sliceData = result.slice(0, 20);
      }
      res.send(sliceData);
    });

    app.get("/mytoys/:id", async (req, res) => {
      const result = await toyCollection
        .find({ _id: new ObjectId(req.params.id) })
        .toArray();
      res.send(result);
    });

    //get single data in database
    app.get("/alltoys/:id", async (req, res) => {
      const result = await toyCollection
        .find({
          _id: new ObjectId(req.params.id),
        })
        .toArray();

      res.send(result);
    });

    //get teddy category
    app.get("/teddyBear", async (req, res) => {
      const result = await teddyBearCollection.find().toArray();
      res.send(result);
    });

    app.get("/teddyDetails/:id", async (req, res) => {
      const result = await teddyBearCollection
        .find({ _id: new ObjectId(req.params.id) })
        .toArray();
      res.send(result);
    });

    //get dinosaur cetegory
    app.get("/dinosaur", async (req, res) => {
      const result = await dinosaurCollection.find().toArray();
      res.send(result);
    });

    app.get("/dinosaurDetails/:id", async (req, res) => {
      const result = await dinosaurCollection
        .find({ _id: new ObjectId(req.params.id) })
        .toArray();

      res.send(result);
    });

    //get cat category
    app.get("/cat", async (req, res) => {
      const result = await catCollection.find().toArray();
      res.send(result);
    });

    app.get("/catDetails/:id", async (req, res) => {
      const result = await catCollection
        .find({ _id: new ObjectId(req.params.id) })
        .toArray();

      res.send(result);
    });

    //all toys search start
    const indexKeys = { toysName: 1 };
    const indexOptions = { name: "toysName" };
    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get("/alltoys", async (req, res) => {
      const searchText = req.query.text || "";
      console.log(searchText);
      if (searchText) {
        const result = await toyCollection
          .find({
            $or: [
              { toysName: { $regex: searchText, $options: "i" } },
              { subCategory: { $regex: searchText, $options: "i" } },
            ],
          })
          .toArray();
        res.send(result);
      } else {
        const result = await toyCollection.find({}).toArray();
        res.send(result);
      }
    });
    //all toys search end

    // add toy data stored
    app.post("/addtoys", async (req, res) => {
      const result = await toyCollection.insertOne(req.body);
      res.send(result);
    });

    //update toys information
    app.patch("/updateToys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateData = req.body;
      const updateDoc = {
        $set: {
          price: updateData.price,
          quantity: updateData.quantity,
          description: updateData.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //delete items
    app.delete("/deleteToys/:id", async (req, res) => {
      const result = await toyCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //empty
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy thriver api running");
});

app.listen(port, (req, res) => {
  console.log(`toy thriver api running port : ${port}`);
});
