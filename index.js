
const express = require('express')
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT | 5000
require('dotenv').config()

// middleware//
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cvl7r98.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// -------------------------------------------------------run

async function run(){
    try{
        // collection
        const serviceCollection = client.db('Travel').collection('services');


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