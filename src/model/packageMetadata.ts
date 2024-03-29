/**
 * ECE 461 - Spring 2023 - Project 2
 * API for ECE 461/Spring 2023/Project 2: A Trustworthy Module Registry
 *
 * The version of the OpenAPI document: 2.0.0
 * Contact: davisjam@purdue.edu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import mongoose from "mongoose";
import { transform } from "./transform";

/**
 * The \"Name\" and \"Version\" are used as a unique identifier pair when uploading a package.  The \"ID\" is used as an internal identifier for interacting with existing packages.
 */
export interface PackageMetadata {
  /**
   * Name of a package.  - Names should only use typical \"keyboard\" characters. - The name \"*\" is reserved. See the `/packages` API for its meaning.
   */
  Name: string;
  /**
   * Package version
   */
  Version: string;
  /**
   *
   */
  ID: string;
}

export const PackageMetadataSchema = new mongoose.Schema<PackageMetadata>({
  Name: { type: String, required: true },
  Version: { type: String, required: true },
  ID: { type: String, required: true },
});

PackageMetadataSchema.set("toObject", { transform });

export const PackageMetadataModel = mongoose.model<PackageMetadata>(
  "PackageMetadata",
  PackageMetadataSchema
);
