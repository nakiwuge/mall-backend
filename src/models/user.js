import  mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: Number,
  password: String,
  isVerified: Boolean,
  createdAt: String ,
  updatedAt: String,
roleId: String,
  stores: [
    { type: Schema.Types.ObjectId, ref:'Store' }
  ],
  categories: [
    { type: Schema.Types.ObjectId, ref:'StoreCategory' }
  ]
});

const User = mongoose.model('User', userSchema);

export default User;