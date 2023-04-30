// Transform so that we can be in compliance with the spec

export function transform(doc, ret, options) {
  // remove the _id and __v of every document before returning the result
  delete ret._id;
  delete ret.__v;
  delete ret.Readme; // Delete the readme before sending back to user

  // If the user wants to remove any other fields, do so
  // This is useful for removing fields that are not in the spec
  // An example, package.toObject({remove: "URL"}) will remove the URL field
  if (options.remove) {
    if (typeof options.remove === "string") {
      options.remove = [options.remove];
    }
    options.remove.forEach(function (prop) {
      delete ret[prop];
    });
  }

  return ret;
}
