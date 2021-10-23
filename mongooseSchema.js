import mongoose from 'mongoose';
const { Schema } = mongoose;

const product = new Schema({
  id: Number,
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: String,
  features: Array
});
const styles = new Schema({
  product_id: Number,
  results: [{style_id: Number, name: String, original_price: String, sale_price: String,
  default?: true, photos: [{thumbnail_url: String, url: String}], skus: {skuSchema}}]
});
const skuSchema = new Schema({
  id: Number,
  quantity: Number,
  size: String
});
const related = new Schema({
  ids: Array
});
