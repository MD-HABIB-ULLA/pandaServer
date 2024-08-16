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
                const { search, category, brandName, sort, page, limit = 12, minPrice, maxPrice } = req.query;
                const skip = (page - 1) * limit;

                let query = {};

                // Building query object based on search and filter criteria
                if (search) {
                    query.name = new RegExp(search, 'i');
                }
                if (category) {
                    query.category = category;
                }
                if (brandName) {
                    query.brand = brandName;
                }
                console.log(minPrice, maxPrice)
                if (minPrice && maxPrice) {
                    query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
                } else if (minPrice) {
                    query.price = { $gte: parseFloat(minPrice) };
                } else if (maxPrice) {
                    query.price = { $lte: parseFloat(maxPrice) };
                }
                const ProductCount = await allProduct.find(query).toArray()
                const count = ProductCount.length
                // Fetching products with filtering, pagination, and sorting
                const products = await allProduct.find(query)
                    .skip(parseInt(skip))
                    .limit(parseInt(limit))
                    .sort(getSortQuery(sort))
                    .toArray();

                return res.send({ count, products }); // Send JSON response

            } catch (error) {
                console.error(error);
                return res.status(500).send("Internal Server Error"); // Handle errors properly
            }
        });

        // Helper function to handle sorting
        const getSortQuery = (sort) => {
            switch (sort) {
                case 'low-to-high':
                    return { price: 1 };
                case 'high-to-low':
                    return { price: -1 };
                case 'newest-first':
                    return { date: -1 };
                default:
                    return {}; // No sorting
            }
        };




        // find the category wise brand name 
        app.get("/brands", async (req, res) => {
            const result = await allProduct.aggregate([
                {
                    $group: {
                        _id: "$category",
                        brands: { $addToSet: "$brand" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        category: "$_id",
                        brands: 1
                    }
                }
            ]).toArray();
            res.send(result)
        })
        app.get("/Shoe", async (req, res) => {
            const result = await allProduct.find({ category: "Shoe" }).toArray()

            res.send(result)
        })
        app.get("/Watch", async (req, res) => {
            const result = await allProduct.find({ category: "Watch" }).toArray()

            res.send(result)
        })
        app.get("/TV", async (req, res) => {
            const result = await allProduct.find({ category: "TV" }).toArray()

            res.send(result)
        })
        app.get("/Bag", async (req, res) => {
            const result = await allProduct.find({ category: "Bag" }).toArray()

            res.send(result)
        })
        app.get("/brand", async (req, res) => {
            const { brandName } = req.query
            console.log(brandName)
            const result = await allProduct.find({ brand: brandName }).toArray()

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
