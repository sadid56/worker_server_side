const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken')
const cookiePerser = require('cookie-parser')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
  origin: ['https://assignment-11-96d26.web.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookiePerser())




const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzbhwpo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middlewares 
const logger = (req, res, next) =>{
  console.log('log: info', req.method, req.url);
  next();
}

  // verify jwt token in auth
  const verifyToken = async(req, res, next)=>{
    const token = req.cookies?.token;
    if(!token){
      return res.status(401).send({message: 'not authraized'})
    }
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded)=>{
      if(err){
        return res.status(401).send({message: 'unauthorized'})
      }
      req.user = decoded
      next()
    })
  }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const JobsCollection = client.db("assignment-11").collection("jobs");
    const bidsCollection = client.db("assignment-11").collection("bids");

    //! auth jwt token related
    app.post('/jwt',logger, async(req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET_TOKEN, {expiresIn: '1hr'})
      res.cookie('token', token, {
        httpOnly: true,
        secure: false
      })
      res.send({success:true})
    })

    app.post('/logOut', async(req, res)=>{
      const user = req.body;
      console.log('log out', user);
      res.clearCookie('token',{maxAge: 0}).send({message: 'success'})
    })

    //! CRUD Operation
    // job related
    // post
    app.post("/jobs", async (req, res) => {



      const addJobs = req.body;
      const result = await JobsCollection.insertOne(addJobs);
      res.send(result);
    });

    //get
    // sort data : http://localhost:5000/jobs?category=Web-development
    app.get("/jobs", async (req, res) => {
     
      // console.log(req.user?.email);
      // if(!req.user?.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }

      let query = {};
      if (req?.query?.email) {
        query = { email: req.query.email };
      }
      const result = await JobsCollection.find(query).toArray();
      res.send(result);
    });

    //get specifiec data
    app.get("/jobs/:id",async (req, res) => {


      // if(req.user?.email !== req.query?.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }


      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await JobsCollection.findOne(query);
      res.send(result);
    });

    // update jobs
    app.patch("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const options = { upsert: true };

      const updateJobs = {
        $set: {
          job_title: body.job_title,
          deadline: body.deadline,
          short_description: body.short_description,
          category: body.category,
          minPrice: body.minPrice,
          maxPrice: body.maxPrice,
        },
      };

      const result = await JobsCollection.updateOne(
        filter,
        updateJobs,
        options
      );
      res.send(result);
    });

    // delete job
    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await JobsCollection.deleteOne(filter);
      res.send(result);
    });

    //! bid related
    //post bids
    app.post("/bids", async (req, res) => {
      const bids = req.body;

      const result = await bidsCollection.insertOne(bids);
      res.send(result);
    });
    //get bids
    //http://localhost:5000/bids?sortField=status&sortOrder=asc
    app.get("/bids", async (req, res) => {

      // console.log('email',req.query?.email);
      // // check jwt token
      // if(req.user?.email !== req.query?.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }

      // sort
      let filter = {};
      let sort = {};
      const status = req.query.status;
      const sortField = req.query.sortField;
      const sortOrder = req.query.sortOrder;

      //  console.log(req.query.status);
      if (status) {
        filter.status = filter;
      }

      if (sortField && sortOrder) {
        sort[sortField] = sortOrder;
      }

      let query = {};
      // console.log(req.query);
      if (req?.query?.email) {
        query = { email: req.query.email };
      }

      // if(req.query?.email !== req.user?.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }

      const result = await bidsCollection
        .find(query, filter)
        .sort(sort)
        .toArray();
      res.send(result);
    });

    // get in some data
    app.get("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bidsCollection.findOne(filter);
      res.send(result);
    });

    // update a accept , reject, complete
    app.patch("/bids/:id", async (req, res) => {

      // if(req.query?.email !== req.user?.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }


      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const update = req.body;
      const updateAccept = {
        $set: {
          status: update.status,
        },
      };
      const result = await bidsCollection.updateOne(
        query,
        updateAccept,
        options
      );
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("assignment 11 server running");
});

app.listen(port, () => {
  console.log(`Assignment 11 running ${port}`);
});
