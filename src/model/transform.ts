// Transform so that we can be in compliance with the spec

export function transform(doc, ret, options) {
  // remove the _id and __v of every document before returning the result
  delete ret._id;
  delete ret.__v;

  return ret;
}
