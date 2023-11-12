const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  filename: String,
});
// set thumbnail img size
imageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('upload', '/upload/w_200');
});

const productSchema = new mongoose.Schema(
  {
    deviceStatus: String,
    images: [imageSchema],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere', // Create a geospatial index
      },
    },
    deviceType: String,
    description: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
