const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nyvh0ei.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const foodCollection = client.db('foodsDB').collection('foods');
    const requestedFoodCollection = client.db('foodsDB').collection('requestedFoods');

    // foods

    app.get('/foods', async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/foods/manage/:donator_email', async (req, res) => {
      const donator_email = req.params.donator_email;
      const query = { donator_email: donator_email };
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/requestedFoods', async (req, res) => {
      const cursor = requestedFoodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    })

    app.post('/foods', async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    })

    app.post('/requestedFoods', async (req, res) => {
      const requestedFood = req.body;
      console.log(requestedFood);
      const result = await requestedFoodCollection.insertOne(requestedFood);
      res.send(result);
    })

    app.put('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedFood = req.body;
      const options = { upsert: true };
      console.log(updatedFood);
      const updateDoc = {
        $set: {
          food_name: updatedFood.food_name, image: updatedFood.image, quantity: updatedFood.quantity, pickup_location: updatedFood.pickup_location, expired_date: updatedFood.expired_date, additional_notes: updatedFood.additional_notes, status: updatedFood.status
        },
      };
      const result = await foodCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.delete('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Community-food server running")
})

app.listen(port, () => {
  console.log(`Community-food server running on port: ${port}`)
})