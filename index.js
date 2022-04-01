const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kkrwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 5000;
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
  const reviewsCollection = client.db("karBox").collection("reviews");

  console.log("database connected");
  // get all collections

  app.get("/allCollections", async (req, res) => {
    const result = await servicesCollection.find({}).toArray();
    res.send(result);
  });
  // get single  collection

  app.get("/singleCollection/:id", async (req, res) => {
    const result = await servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray();
    res.send(result[0]);
  });
  // add booking

  app.post("/addBooking", async (req, res) => {
    console.log(req.body);
    const result = await ordersCollection.insertOne(req.body);
    res.send(result);
  });

  // make admin
  app.put("/users/admin", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = { $set: { role: "admin" } };
    const result = await usersCollection.updateOne(filter, updateDoc);
    console.log(result);
    res.json(result);
  });

  // check  admin or not
  app.get("/users/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === "admin") {
      isAdmin = true;
    }
    res.json({ admin: isAdmin });
  });
  // add user

  app.post("/users", async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    console.log(result);
    res.json(result);
  });
  // add user update
  app.put("/users", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
  });
  // get reviews
  app.get("/reviews", async (req, res) => {
    const result = await reviewsCollection.find({}).toArray();
    res.send(result);
  });
  //add  review
  app.post("/addReview", async (req, res) => {
    const result = await reviewsCollection.insertOne(req.body);

    res.send(result);
  });
  //add Collection
  app.post("/addCollection", async (req, res) => {
    const result = await servicesCollection.insertOne(req.body);
    console.log(result);
    res.send(result);
  });
 

 

  app.get("/myOrders/:email", async (req, res) => {
    const result = await ordersCollection
      .find({
        userEmail: req.params.email,
      })
      .toArray();
    res.send(result);
  });

  // delete an order from my order

  app.delete("/deleteOrder/:id", async (req, res) => {
    const result = await ordersCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });
  /// all order
  app.get("/allOrders", async (req, res) => {
    const result = await ordersCollection.find({}).toArray();
    res.send(result);
  });
  // update status to shipped
  app.put("/approveBooking/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const Booking = {
      $set: {
        status: "Shipped",
      },
    };
    const result = await ordersCollection.updateOne(query, Booking);
    res.json(result);
  });
  app.get("/payment/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
   
    const result = await ordersCollection.findOne(query);
    res.json(result);
  });

  // delete booking from manage booking
  app.delete("/DeleteManageBooking/:id", async (req, res) => {
    const result = await ordersCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });
  // delete collections from manage collection
  app.delete("/deleteManageCollection/:id", async (req, res) => {
    const result = await servicesCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`Listening to port : ${port}`);
});
