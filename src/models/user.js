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
  role: String
});

const User = mongoose.model('User', userSchema);

export default User;