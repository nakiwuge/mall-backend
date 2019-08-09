import  mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ItemCategorySchema = new Schema({
  name: { type:String, require:true },
  createdBy: { type: Schema.Types.ObjectId, ref:'User' },
  items: [{ type: Schema.Types.ObjectId, ref:'Item' }],
  createdAt: String ,
  updatedAt: String,
});

const ItemCategory = mongoose.model('ItemCategory', ItemCategorySchema);

export default ItemCategory;