const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 3000;

require('dotenv').config()
app.use(cors({
    origin: [
        "https://panda-9805f.web.app",
        'http://localhost:5173',
    ],
    credentials: true
}));
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://panda:4SFQbJcgyuldxlLv@cluster0.zqymdgy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
        // Send a ping to confirm a successful connection
        const allProduct = client.db("panda").collection("products")
        app.get("/products", async (req, res) => {
            try {
                const { search } = req.query;
                let products;

                if (search) {
                    products = await allProduct.find({ name: new RegExp(search, 'i') }).toArray();
                    return res.send(products); // Use return to exit the function after sending response
                }

                products = await allProduct.find().toArray();
                return res.send(products); // Use return to ensure no further code is executed
            } catch (error) {
                console.error(error);
                return res.status(500).send("Internal Server Error"); // Handle errors properly
            }
        });


        app.get("/shoe", async (req, res) => {
            const result = await allProduct.find({ category: "Shoe" }).toArray()

            res.send(result)
        })
        app.get("/watch", async (req, res) => {
            const result = await allProduct.find({ category: "Watch" }).toArray()

            res.send(result)
        })
        app.get("/tv", async (req, res) => {
            const result = await allProduct.find({ category: "TV" }).toArray()

            res.send(result)
        })
        app.get("/bag", async (req, res) => {
            const result = await allProduct.find({ category: "Bag" }).toArray()

            res.send(result)
        })
        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
