class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // Filtering A (equal states -> price = x, name = x)
    let query = { ...this.queryStr };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];

    excludedFields.forEach((el) => {
      delete query[el];
    });

    // Filtering B (Comparision states -> price gte x )
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    query = JSON.parse(queryStr);
    this.query.find(query);
    return this;
  }

  sort() {
    //Sorting
    if (this.queryStr.sort) {
      let sortQuery = this.queryStr.sort;
      sortQuery = sortQuery.split(',').join(' ');
      this.query.sort(sortQuery);
    } else {
      // sort by createdAt
      this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // Limiting Fields
    if (this.queryStr.fields) {
      let fields = this.queryStr.fields;
      fields = fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // Pagination
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
