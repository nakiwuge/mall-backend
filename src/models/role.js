import  mongoose from 'mongoose';
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: String,
  createdAt: String,
  updatedAt: String,
});

const Role = mongoose.model('Role', roleSchema);

export default Role;