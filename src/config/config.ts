const { MongoClient, ServerApiVersion } = require('mongodb');
import mongoose from 'mongoose';
import { logger } from '../logging';

export async function connectToMongo() {
    /*
    * This function connects to the MongoDB database
    * It should be called before any database operations are performed
    */

    logger.info("connectToMongo(): Connecting to MongoDB...");

    // Set the following environment variables
    const USERNAME: string = process.env.MONGODB_USERNAME || "koltan";
    const PASSWORD: string = process.env.MONGODB_PASSWORD || "aG2uEugh976n8rBn";

    // Keep this as "database"
    // We connect to the database, which will hold a bunch of collections
    // Probably one collection for each file in models/ 
    // Those collections will hold a bunch of documents
    const DATABASE: string = "database";
    const uri = `mongodb://${USERNAME}:${PASSWORD}@ac-buchowe-shard-00-00.bcmdhkp.mongodb.net:27017,ac-buchowe-shard-00-01.bcmdhkp.mongodb.net:27017,ac-buchowe-shard-00-02.bcmdhkp.mongodb.net:27017/${DATABASE}?ssl=true&replicaSet=atlas-zpmc7p-shard-0&authSource=admin&retryWrites=true&w=majority`
    
    await mongoose.connect(uri);

    logger.info("connectToMongo(): Connected to MongoDB");
}

export async function disconnectFromMongo() {
    /*
    * This function disconnects from the MongoDB database
    */

    logger.info("disconnectFromMongo(): Disconnecting from MongoDB...");

    mongoose.connection.close();

    logger.info("disconnectFromMongo(): Disconnected from MongoDB");
}
