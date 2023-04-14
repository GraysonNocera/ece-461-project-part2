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
/**
 *
 */
export interface User {
  /**
   *
   */
  name: string;
  /**
   * Is this user an admin?
   */
  isAdmin: boolean;

  isUpload?: boolean;

  isSearch?: boolean;

  isDownload?: boolean;
}

export const user: mongoose.Schema<User> = new mongoose.Schema<User>({
  name: { type: String, required: true },
  isAdmin: { type: Boolean, required: true },
  isUpload: { type: Boolean, required: false },
  isDownload: { type: Boolean, required: false },
  isSearch: { type: Boolean, required: false },
});

