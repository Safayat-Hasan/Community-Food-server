const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://6557b9f06713b80fbe670e50--magical-biscochitos-6d36e4.netlify.app',
    'https://community-food-9391e.web.app',
    'https://community-food-9391e.firebaseapp.com',
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nyvh0ei.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = (req, res, next) => {
  console.log('{log: info}', req.method, req.url);
  next();
}

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token middle', token);
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access . token not found' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access . token error' })
    }
    req.user = decoded;
    next();
  })
  // next();
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const foodCollection = client.db('foodsDB').collection('foods');
    const requestedFoodCollection = client.db('foodsDB').collection('requestedFoods');

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
        .send({ success: true });
    })

    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logout', user);
      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })

    // foods

    app.get('/foods', async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/foods/search/:food_name', async (req, res) => {
      const food_name = req.params.food_name;
      const query = { food_name: food_name };
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/foods/manage/:donator_email', logger, verifyToken, async (req, res) => {
      const donator_email = req.params.donator_email;
      const query = { donator_email: donator_email };
      const result = await foodCollection.find(query).toArray();
      res.send(result);
      // done
    })

    app.get('/requestedFoods', logger, verifyToken, async (req, res) => {
      const cursor = requestedFoodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      // done
    })

    app.get('/requestedFoods/:food_id', logger, verifyToken, async (req, res) => {
      const food_id = req.params.food_id;
      const query = { food_id: food_id };
      const result = await requestedFoodCollection.findOne(query);
      res.send(result);
      // done
    })

    app.get('/requestedFoods/manage/:user_email', logger, verifyToken, async (req, res) => {
      const user_email = req.params.user_email;
      const query = { user_email: user_email };
      const result = await requestedFoodCollection.find(query).toArray();
      res.send(result);
      // done
    })

    app.get('/foods/:id', logger, verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
      // done
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

    app.patch('/requestedFoods/:food_id', async (req, res) => {
      const food_id = req.params.food_id;
      const filter = { food_id: food_id };
      const updatedFood = req.body;
      console.log(updatedFood);
      const updateDoc = {
        $set: {
          status: updatedFood.status
        },
      };
      const result = await requestedFoodCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.patch('/foods/:_id', async (req, res) => {
      const _id = req.params._id;
      const filter = { _id: new ObjectId(_id) };
      const updatedFood = req.body;
      console.log(updatedFood);
      const updateDoc = {
        $set: {
          status: updatedFood.status
        },
      };
      const result = await foodCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    })

    app.delete('/requestedFoods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await requestedFoodCollection.deleteOne(query);
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