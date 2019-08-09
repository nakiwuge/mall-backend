import  mongoose from 'mongoose';

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: { type:String, require:true },
  store: { type: Schema.Types.ObjectId, ref:'Store' },
  description: String,
  price:String,
  negotiable:Boolean,
  category:{ type: Schema.Types.ObjectId, ref:'ItemCategory' },
  imageUrl: String,
  createdAt: String ,
  updatedAt: String,
});

const Item = mongoose.model('Item', itemSchema);

export default Item;