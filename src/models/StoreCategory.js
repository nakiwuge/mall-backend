import  mongoose from 'mongoose';
const Schema = mongoose.Schema;

const StoreCategorySchema = new Schema({
  name: { type:String, require:true },
  createdBy: { type: Schema.Types.ObjectId, ref:'User' },
  stores: [{ type: Schema.Types.ObjectId, ref:'Store' }],
  createdAt: String ,
  updatedAt: String,
});

const StoreCategory = mongoose.model('StoreCategory', StoreCategorySchema);

export default StoreCategory;