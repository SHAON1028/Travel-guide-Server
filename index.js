
const express = require('express')
const timestamp = require('time-stamp');
const jwt = require('jsonwebtoken');
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT | 5000
require('dotenv').config()

// middleware//
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    res.header({"Access-Control-Allow-Origin": "*"});
    next();
  }) 



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cvl7r98.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}
// -------------------------------------------------------run

async function run(){
    try{
        // collection
        const serviceCollection = client.db('Travel').collection('services');
        const reviewCollection = client.db('Travel').collection('reviews');

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '100d'})
            res.send({token})
        })  
        // operation

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
           
            res.send(services);
        });
        app.get('/home', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
           
            const serviceLimit = await cursor.limit(3).toArray()
            res.send(serviceLimit);
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result);
        });
        app.post('/services', async (req, res) => {
            const review = req.body;
            const result = await serviceCollection.insertOne(review)
            res.send(result);
        });
        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query).sort({field:-1});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        // get review by id
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { reviewId: id };
            const cursor = reviewCollection.find(query).sort({field:-1});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        app.get('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });

        // my reviews data
        app.get('/myreviews', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        // update
        app.patch("/myreviews/:id", async (req, res) => {
            const { id } = req.params;
          
            try {
              const result = await reviewCollection.updateOne({ _id: ObjectId(id) }, { $set: req.body });
          
              if (result.matchedCount) {
                res.send({
                  success: true,
                  message: `successfully updated ${req.body.message}`,
                });
              } else {
                res.send({
                  success: false,
                  error: "Couldn't update  the product",
                });
              }
            } catch (error) {
              res.send({
                success: false,
                error: error.message,
              });
            }
          });
        // DELETE
        app.delete('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })




    }
    finally{

    }
}

run().catch(err => console.error(err));



app.get('/',(req,res)=>{
    res.send(' server is running')
})

app.listen(port,()=>{
    console.log(`server is running on: ${port}`)
})