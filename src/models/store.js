import  mongoose from 'mongoose';

const Schema = mongoose.Schema;

const storeSchema = new Schema({
  name: { type:String, require:true },
  owner: { type: Schema.Types.ObjectId, ref:'User' },
  description: String,
  category:{ type: Schema.Types.ObjectId, ref:'StoreCategory' },
  imageUrl: String,
  createdAt: String ,
  updatedAt: String,
});

const Store = mongoose.model('Store', storeSchema);

export default Store;