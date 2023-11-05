const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




app.get('/', (req, res) => {
    res.send("Community-food server running")
})

app.listen(port, () => {
    console.log(`Community-food server running on port: ${port}`)
})