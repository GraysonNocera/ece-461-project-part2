import mongoose from "mongoose"
import { connectToMongo, disconnectFromMongo, uploadFileToMongo } from "../src/config/config"
import path from "path";

connectToMongo().then(() => {
  console.log("connected to mongo")

  let filePath = path.join(__dirname, "file.txt")
  let fileName = "file.txt"
  console.log("uploading file")
  uploadFileToMongo(filePath, new mongoose.Types.ObjectId("64449f0bb40044f41e4be7a1"));
})