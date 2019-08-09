import StoreCategory from '../models/StoreCategory';
import Store from '../models/store';

export const getStoreCategory = async (id)=>{
  const category = await StoreCategory.findById(id).populate('createdBy', '-password')
    .populate('stores');

  if(!category ){
    throw new Error('Category not found');
  }

  return category ;
};

export const getStore = async (id)=>{
  const store = await Store.findById(id).populate('owner', '-password')
    .populate('category')
    .populate('items');

  if(!store ){
    throw new Error('Store not found');
  }

  return store ;
};