// This file is just to see how mongoose is used. Don't include this file anywhere

import mongoose from "mongoose";
import { connectToMongo, disconnectFromMongo } from "./config";

// The way mongodb works is that databases are made up of collections, and collections are made up of documents
// Documents are just JSON objects, and collections are just arrays of JSON objects
// The way mongoose works is that it allows us to define a schema for our documents, and then we can use that schema to create
// new instances of the model, which are then saved as documents in the database
// This lets us have some consistency in our collections to avoid
// having to write a bunch of validation code for each document
// Not sure if we will need joi in this case, but it might be useful for other things
// (joi is just an npm package for input validation)

// Mongoose getting started: https://mongoosejs.com/docs/index.html
// Mongoose documentation: https://mongoosejs.com/docs/guides.html
// Plugging this again because it's a good read: https://www.mongodb.com/languages/mean-stack-tutorial

async function main() {

    await connectToMongo();

    // This defines a schema in mongoose, which is equivalent to what 
    // we have in the models/ folder right now
    const schema = new mongoose.Schema({ 
        name: String,
        summary: String,
        space: String,
    });

    // Model is now a class that we can use to create new instances of the model
    const Model = mongoose.model("Model", schema)

    const data1 = new Model({ name: "test", summary: "test", space: "test"});
    const data2 = new Model({ name: "data", summary: "data", space: "data"});

    // We can save this as a document in the database, and it will automatically be saved
    // into the models collection
    await data1.save(); // this should be an async function
    await data2.save();

    // Create operation
    // Shown above

    // Read operation
    // The query will get all instances of Model in the database where the name is test
    const query = Model.where({ name: 'test' });
    const person = await query.findOne(); // this should be an async function
    console.log(person);
    // See https://mongoosejs.com/docs/api/query.html for more info

    // Update operation
    // This will update the name of the person to "test2"
    const result = await Model.updateOne({ name: 'test' }, {
        name: 'test2'
    });
    console.log(result.modifiedCount);

    // Delete operation
    const delete_result = await Model.deleteOne({ name: 'data' });
    console.log(delete_result);

    // This is how you can assign the ID of something to the _id from mongodb
    // There's probably a better way to do this, but this is what I came up with
    // So I am basically mirroring the value from _id that mongodb gives us into 
    // a new field called something like ID (to be in compliance with the PackageMetadata schema)
    const new_schema = new mongoose.Schema({
        parentId: String,
        name: String,
    });
    const new_model = mongoose.model("TestingID", new_schema);
    const new_data = new new_model({ name: "test" });
    await new_data.save();
    const res = new_model.updateOne({ name: new_data.name, _id: new_data._id }, { parentId: new_data._id.toString() });
    console.log((await res).modifiedCount)

    disconnectFromMongo();
}

main();

// Random code that may or may not be useful
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// client.connect(err => {
//   if (err) 
//     console.log(err)

//   const collection = client.db("Cluster0").collection("sample_airbnb");

//   console.log(collection.find({name: "Ribeira Charming Duplex"}));
//   // perform actions on the collection object

//   client.close();
// });


// var MongoClient = require('mongodb').MongoClient;

// MongoClient.connect(uri, function(err, client) {
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

