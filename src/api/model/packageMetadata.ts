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

import { RequestFile } from './models';

/**
* The \"Name\" and \"Version\" are used as a unique identifier pair when uploading a package.  The \"ID\" is used as an internal identifier for interacting with existing packages.
*/
export class PackageMetadata {
    /**
    * Name of a package.  - Names should only use typical \"keyboard\" characters. - The name \"*\" is reserved. See the `/packages` API for its meaning.
    */
    'name': string;
    /**
    * Package version
    */
    'version': string;
    /**
    * 
    */
    'iD': string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "Name",
            "type": "string"
        },
        {
            "name": "version",
            "baseName": "Version",
            "type": "string"
        },
        {
            "name": "iD",
            "baseName": "ID",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return PackageMetadata.attributeTypeMap;
    }
}

