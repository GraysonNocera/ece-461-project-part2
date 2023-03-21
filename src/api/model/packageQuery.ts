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


/**
 * 
 */
export interface PackageQuery { 
    /**
     * 
     */
    Version?: string;
    /**
     * Name of a package.  - Names should only use typical \"keyboard\" characters. - The name \"*\" is reserved. See the `/packages` API for its meaning.
     */
    Name: string;
}
