const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kkrwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)
const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

client.connect((err) => {
  const servicesCollection = client.db("karBox").collection("collections");
  const usersCollection = client.db("karBox").collection("users");
  const ordersCollection = client.db("karBox").collection("orders");
  const reviewCollection = client.db("karBox").collection("review");


console.log("database connected")
 // get all collections

 app.get("/allCollections", async (req, res) => {
    const result = await servicesCollection.find({}).toArray();
    res.send(result);
  });
// get single  collection

app.get("/singleCollection/:id",async (req, res) => {
    console.log(req.params.id);
    const result = await servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray();
    res.send(result[0]);
    console.log(result);
  });
 
});

app.listen(process.env.PORT || port);
