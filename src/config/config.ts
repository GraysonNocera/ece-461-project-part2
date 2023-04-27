const { MongoClient, ServerApiVersion } = require("mongodb");
import mongoose from "mongoose";
import { logger } from "../logging";
import * as fs from "fs";
import path from "path";
import { deleteBase64File } from "../service/zip";

let bucket: mongoose.mongo.GridFSBucket;
export async function connectToMongo() {
  /*
   * This function connects to the MongoDB database
   * It should be called before any database operations are performed
   */

  logger.info("connectToMongo(): Connecting to MongoDB...");


  // Set the following environment variables
  const USERNAME: string = process.env.MONGODB_USERNAME || "";
  const PASSWORD: string = process.env.MONGODB_PASSWORD || "";

  // Keep this as "database"
  // We connect to the database, which will hold a bunch of collections
  // Probably one collection for each file in models/
  // Those collections will hold a bunch of documents
  const DATABASE: string = "database";
  const uri = `mongodb://${USERNAME}:${PASSWORD}@ac-buchowe-shard-00-00.bcmdhkp.mongodb.net:27017,ac-buchowe-shard-00-01.bcmdhkp.mongodb.net:27017,ac-buchowe-shard-00-02.bcmdhkp.mongodb.net:27017/${DATABASE}?ssl=true&replicaSet=atlas-zpmc7p-shard-0&authSource=admin&retryWrites=true&w=majority`;

  await mongoose.connect(uri);

  //creating bucket
  let db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "Content",
  });

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

export async function uploadFileToMongo(
  filePath: string,
  id: mongoose.Types.ObjectId
) {
  // Uploads a file to MongoDB, assumes there is a txt file at filePath
  // It removes the file aftewards

  let fileName: string = path.basename(filePath);

  // If this is PUT /package, the package already exists, so we must delete it
  try {
    await bucket.delete(id);
  } catch (err) {
    logger.debug("uploadFileToMongo: No file to delete in mongo");
  }

  logger.info("uploadFileToMongo: Uploading file to MongoDB: " + fileName);

  let stream = bucket.openUploadStreamWithId(id, fileName);
  stream.id = id;

  fs.createReadStream(filePath)
    .pipe(stream)
    .on("error", function (error) {
      logger.debug("uploadFileToMongo: Error in inserting file: " + error);
    })
    .on("finish", function () {
      logger.info("uploadFileToMongo: File Inserted into mongo, deleting it locally");
      deleteBase64File(filePath);
    });
}

export async function downloadFileFromMongo(
  id: mongoose.Types.ObjectId,
  callback: Function
) {
  let content: string;
  let filePath: string;

  logger.info("downloadFileFromMongo: Downloading file from MongoDB: " + id);

  filePath = path.join(__dirname, "..", "artifacts", id.toString());

  bucket
    .openDownloadStream(id)
    .pipe(fs.createWriteStream(filePath))
    .on("error", function (error) {
      logger.debug("downloadFileFromMongo: Error in downloading file: " + error);
      callback(null, error);
    })
    .on("finish", function () {
      logger.info("downloadFileFromMongo: File Downloaded");
      content = fs.readFileSync(filePath, "base64");
      deleteBase64File(filePath);
      callback(content, null);
    });
}

export async function deleteFileFromMongo(id: mongoose.Types.ObjectId) {
  logger.info("deleteFileFromMongo(): Deleting file from MongoDB: " + id);

  try {
    await bucket.delete(id);
  } catch (err) {
    logger.debug("deleteFileFromMongo: No file to delete in mongo");
  }
}
