var mongoose = require('mongoose');

module.exports = function(schema) {
  schema.statics.isValidId = function(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }
};
