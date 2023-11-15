class APIFeatures {
  constructor(query, queryStr) {
    // query is query object from mongoose
    // queryStr is query string from route (express)
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // 1) Filtering
    let queryObj = { ...this.queryStr }; // make hard copy of query obj
    const excludeFields = ["sort", "page", "limit", "fields"];
    excludeFields.forEach((mov) => delete queryObj[mov]);

    // 1.5) Advanced Filtering
    queryObj = JSON.stringify(queryObj).replace(
      /\b(lt|lte|gt|gte)\b/g, // b flag to macth EXACT word
      (m) => `$${m}`
    );

    this.query = this.query.find(JSON.parse(queryObj));

    return this;
  }

  sort() {
    // 2) SORTING
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.replaceAll(",", " ");
      this.query = this.query.sort(sortBy);
    } else {
      // query = query.sort("-terbuatDi");
    }

    return this;
  }

  fields() {
    // 3) FIELDS LIMITING
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.replaceAll(",", " ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  page() {
    // 4) PAGINATION
    // page 1 = 0-9, page 2 = 10-19, page 3 = 20-29, page 4 = 30 - 39
    // skip = limit * (page - 1)

    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || 50;

    this.query = this.query.skip(limit * (page - 1)).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
