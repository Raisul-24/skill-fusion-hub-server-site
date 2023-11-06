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
      app.get('/jobs', async (req, res) => {
         const cursor = jobCollection.find();
         const result = await cursor.toArray();
         res.send(result);
      });
      // get specific jobs
      app.get('/jobs/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const result = await jobCollection.findOne(query);
         res.send(result);
      });
      // post jobs to all jobs
      app.post('/jobs', async (req, res) => {
         const newJob = req.body;
         console.log(newJob);
         const result = await jobCollection.insertOne(newJob);
         res.send(result);
      });


      // get specific email-holder my carts posted jobs for individual users
      app.get('/myCart', async (req, res) => {
         console.log(req.query);
         let query = {}
         if (req.query?.developer_email) {
             query = { developer_email: req.query.developer_email }
         }
         else if (req.query?.buyer_email) {
             query = { buyer_email: req.query.buyer_email }
         }
         const result = await jobCartCollection.find(query).toArray();
         res.send(result);
      });
      // post my cart jobs
      app.post('/myCart', async (req, res) => {
         const job = req.body;
         console.log(job);
         const result = await jobCartCollection.insertOne(job);
         res.send(result);
      });
// update 
   app.patch('/myCart/:id', async(req,res) =>{
      const id = req.params.id;
      // console.log(id)
      const filter = {_id: new ObjectId(id)}
      const status = req.body.status;
      const completeStatus = req.body.completeStatus;
      console.log("sta, complete", status,completeStatus);
      let updateDoc ={}
      if(status){
          updateDoc = {
            $set:{
               status : status
            },
         };
      }
      else if(completeStatus){
          updateDoc = {
            $set:{
               completeStatus:completeStatus
            },
         };
      }

     const result = await jobCartCollection.updateOne(filter,updateDoc);
     res.send(result);
   })


      // get specific email-holder jobs for individual users
      app.get('/postedJobs', async (req, res) => {
         console.log(req.query);
         let query = {}
         if (req.query?.email) {
            query = { email: req.query.email }
         }
         const result = await postedJobCollection.find(query).toArray();
         res.send(result);
      });
      // get specific posted job for update
      app.get('/postedJobs/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const result = await postedJobCollection.findOne(query);
         res.send(result);
      });
      // post jobs
      app.post('/postedJobs', async (req, res) => {
         const newJob = req.body;
         console.log(newJob);
         const result = await postedJobCollection.insertOne(newJob);
         res.send(result);
      });


      // delete posted jobs
      app.delete('/postedJobs/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const result = await postedJobCollection.deleteOne(query);
         res.send(result)
      });
      // update selected posted job
      app.put('/postedJobs/:id', async (req, res) => {
         const id = req.params.id;
         const filter = { _id: new ObjectId(id) }
         const options = { upsert: true }
         const updatedJob = {
            $set: {
               // job_title, email, deadline, minimum_price, maximum_price,short_description
               job_title: req.body.job_title,
               category: req.body.category,
               email: req.body.email,
               deadline: req.body.deadline,
               minimum_price: req.body.minimum_price,
               maximum_price: req.body.maximum_price,
               short_description: req.body.short_description,
            }
         }
         const result = await postedJobCollection.updateOne(filter, updatedJob, options);
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