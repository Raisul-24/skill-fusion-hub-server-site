const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3001;

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sxdrhxr.mongodb.net/?retryWrites=true&w=majority`;
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
      //  await client.connect();

      const jobCollection = client.db('skillFusionHubDB').collection('jobs');
      const postedJobCollection = client.db('skillFusionHubDB').collection('postedJobs');
      const jobCartCollection = client.db('skillFusionHubDB').collection('myCart');

      // get all jobs
      app.get('/jobs', async(req,res) => {
         const cursor = jobCollection.find();
         const result = await cursor.toArray();
         res.send(result);
      });
      // get specific jobs
      app.get('/jobs/:id', async(req,res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id)}
         const result = await jobCollection.findOne(query);
         res.send(result);
      });
      // get specific jobs for individual users
      app.get('/postedJobs', async(req,res) =>{
         console.log(req.query);
         let query = {}
         if(req.query?.email){
            query = { email: req.query.email }
         }
         const result = await postedJobCollection.find().toArray();
         res.send(result);
      })
      // post jobs
      app.post('/postedJobs', async(req, res) =>{
         const newJob = req.body;
         console.log(newJob);
         const result = await postedJobCollection.insertOne(newJob);
         res.send(result);
      });
      // post my cart jobs
      app.post('/myCart', async(req, res) =>{
         const job = req.body;
         console.log(job);
         const result = await jobCartCollection.insertOne(job);
         res.send(result);
      });


      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // Ensures that the client will close when you finish/error
      //  await client.close();
   }
}
run().catch(console.dir);
app.get('/', (req, res) => {
   res.send("Skill Fusion Hub Server is running");
})

app.listen(port, () => {
   console.log(`Skill Fusion Hub is running on port: ${port}`);
})