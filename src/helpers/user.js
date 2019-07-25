import User from '../models/user';

export const getUser = async (id)=>{
  const user = await User.findById(id).populate('stores');

  if(!user){
    throw new Error('User not found');
  }

  return user;
};
