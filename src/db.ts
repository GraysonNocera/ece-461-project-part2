const { MongoClient, ServerApiVersion } = require('mongodb');
import mongoose from 'mongoose';

const USERNAME: string = process.env.MONGODB_USERNAME || "";
const PASSWORD: string = process.env.MONGODB_PASSWORD || "";
const uri = `mongodb://${USERNAME}:${PASSWORD}@ac-buchowe-shard-00-00.bcmdhkp.mongodb.net:27017,ac-buchowe-shard-00-01.bcmdhkp.mongodb.net:27017,ac-buchowe-shard-00-02.bcmdhkp.mongodb.net:27017/sample_airbnb?ssl=true&replicaSet=atlas-zpmc7p-shard-0&authSource=admin&retryWrites=true&w=majority`

mongoose
  .connect(uri)
  .then(async () => { 
    console.log("Connected to MongoDB");

    const collection = mongoose.connection.db.collection("sample_airbnb");
    const schema = new mongoose.Schema({ name: String });
    const Stuff = mongoose.model("Stuff", schema);
    const my_stuff = new Stuff({ name: "HI!!"});

    // const listing = mongoose.model()

    await my_stuff.save();

    console.log("saved stuff")
    //const my_model = new mongoose.Model("stuff", schema);
  })
  .catch((err) => { console.log("Error " + err) });

console.log("got here\n");
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log("got here\n");
// console.log(client)

client.connect(err => {
  if (err) 
    console.log(err)

  console.log("got here\n");

  const collection = client.db("Cluster0").collection("sample_airbnb");

  console.log(collection.find({name: "Ribeira Charming Duplex"}));
  // perform actions on the collection object

  client.close();
});


// var MongoClient = require('mongodb').MongoClient;

// console.log("got here\n");
// MongoClient.connect(uri, function(err, client) {
//   console.log("got here\n");
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

// console.log("hi\n");



// /* global use, db */
// // MongoDB Playground
// // To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// // Make sure you are connected to enable completions and to be able to run a playground.
// // Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// // The result of the last command run in a playground is shown on the results panel.
// // By default the first 20 documents will be returned with a cursor.
// // Use 'console.log()' to print to the debug output.
// // For more documentation on playgrounds please refer to
// // https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// // Select the database to use.
// use('mongodbVSCodePlaygroundDB');

// // Insert a few documents into the sales collection.
// db.getCollection('sales').insertMany([
//   { 'item': 'abc', 'price': 10, 'quantity': 2, 'date': new Date('2014-03-01T08:00:00Z') },
//   { 'item': 'jkl', 'price': 20, 'quantity': 1, 'date': new Date('2014-03-01T09:00:00Z') },
//   { 'item': 'xyz', 'price': 5, 'quantity': 10, 'date': new Date('2014-03-15T09:00:00Z') },
//   { 'item': 'xyz', 'price': 5, 'quantity': 20, 'date': new Date('2014-04-04T11:21:39.736Z') },
//   { 'item': 'abc', 'price': 10, 'quantity': 10, 'date': new Date('2014-04-04T21:23:13.331Z') },
//   { 'item': 'def', 'price': 7.5, 'quantity': 5, 'date': new Date('2015-06-04T05:08:13Z') },
//   { 'item': 'def', 'price': 7.5, 'quantity': 10, 'date': new Date('2015-09-10T08:43:00Z') },
//   { 'item': 'abc', 'price': 10, 'quantity': 5, 'date': new Date('2016-02-06T20:20:13Z') },
// ]);

// // Run a find command to view items sold on April 4th, 2014.
// const salesOnApril4th = db.getCollection('sales').find({
//   date: { $gte: new Date('2014-04-04'), $lt: new Date('2014-04-05') }
// }).count();

// // Print a message to the output window.
// console.log(`${salesOnApril4th} sales occurred in 2014.`);

// // Here we run an aggregation and open a cursor to the results.
// // Use '.toArray()' to exhaust the cursor to return the whole result set.
// // You can use '.hasNext()/.next()' to iterate through the cursor page by page.
// db.getCollection('sales').aggregate([
//   // Find all of the sales that occurred in 2014.
//   { $match: { date: { $gte: new Date('2014-01-01'), $lt: new Date('2015-01-01') } } },
//   // Group the total sales for each product.
//   { $group: { _id: '$item', totalSaleAmount: { $sum: { $multiply: [ '$price', '$quantity' ] } } } }
// ]);

