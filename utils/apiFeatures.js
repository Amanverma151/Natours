// Creating a class for API Features
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Build query
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString }; // creating a copy of the query object using structuring
    const exculdedFields = ["page", "sort", "limit", "fields"];
    exculdedFields.forEach((el) => delete queryObj[el]); // deleting the excluded fields from the queryObj one by one

    // Advance Filtering
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      // replacing the opertor with same "$" in front
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    //  let query = Tour.find(JSON.parse(queryStr)); // .find to get all the data, it will return a promise
    return this; // it will return the entire object so that this function can be called by the obj below
  }

  sort() {
    // Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy); //  sorting the data based on the query
    } else {
      // if there is no sorting mentioned by the user
      this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // Field Limiting (to show only somr fields like name, duration)
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query.select("-__v"); // putting "-" means excluding the field
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1; // getting the page
    const limit = this.queryString.limit * 1 || 10; // getting the limit or setting it to default value using || to 10
    const skip = (page - 1) * limit; // calculating the skip value

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
