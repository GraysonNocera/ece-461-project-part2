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
  content: string,
  id: mongoose.Types.ObjectId
) {
  let filePath: string = path.join(__dirname, "..", "artifacts", `${id}.txt`);

  // Ensure that the file exists at the specified path
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }

  // Get the base file name from the file path
  let fileName: string = path.basename(filePath);

  // If this is PUT /package, the package already exists, so we must delete it
  try {
    await bucket.delete(id);
    logger.info("uploadFileToMongo: Deleted existing file with ID " + id);
  } catch (err) {
    logger.debug("uploadFileToMongo: No file to delete in mongo with ID " + id);
  }

  logger.info("uploadFileToMongo: Uploading file to MongoDB: " + fileName);

  // Create a new stream to upload the file to MongoDB
  let stream = bucket.openUploadStreamWithId(id, fileName);
  stream.id = id;

  // Pipe the file data to the stream
  fs.createReadStream(filePath)
    .pipe(stream)
    .on("error", function (error) {
      logger.info("uploadFileToMongo: Error in inserting file: " + error);
      throw error;
    })
    .on("finish", function () {
      logger.info(
        "uploadFileToMongo: File Inserted into mongo with ID " +
          id +
          ", deleting it locally"
      );
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
      logger.debug(
        "downloadFileFromMongo: Error in downloading file: " + error
      );
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

export async function deleteAllFilesFromMongo() {
  await connectToMongo();

  logger.info("deleteAllFilesFromMongo(): Deleting all files from MongoDB");

  (await bucket.find({}).toArray()).forEach((file) => {
    bucket.delete(file._id);
  });

  logger.info("deleteAllFilesFromMongo(): Deleted all files from MongoDB");
}
