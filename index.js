const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

//4daB0TThbYAlbhgR
//assignment-11


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://assignment-11:4daB0TThbYAlbhgR@cluster0.dzbhwpo.mongodb.net/?retryWrites=true&w=majority";

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
    await client.connect();

    const JobsCollection = client.db('assignment-11').collection('jobs')
    const bidsCollection = client.db('assignment-11').collection('bids')

    //! CRUD Operation
    // job related
    // post
    app.post('/jobs', async(req, res)=>{
      const addJobs = req.body;
      const result = await JobsCollection.insertOne(addJobs)
      res.send(result)
    })


    //get
    app.get('/jobs', async(req, res)=>{
        const result = await JobsCollection.find().toArray()
        res.send(result)
    })

    //get specifiec data
    app.get('/jobs/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await JobsCollection.findOne(query)
      res.send(result)
    })

    // bid related
    //post bids
    app.post('/bids', async(req, res)=>{
      const bids = req.body;
      const result = await bidsCollection.insertOne(bids)
      res.send(result)
    })
    //get bids
    app.get('/bids', async(req, res)=>{
      const result = await bidsCollection.find().toArray()
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('assignment 11 server running')
})

app.listen(port, ()=>{
    console.log(`Assignment 11 running ${port}`);
})