import ItemCategory from '../models/itemCategory';
import Item from '../models/items';

export const getItemCategory = async (id)=>{
  const category = await ItemCategory.findById(id).populate('createdBy', '-password')
    .populate('items');

  if(!category ){
    throw new Error('Category not found');
  }

  return category ;
};

export const getItem = async (id)=>{
  const item = await Item.findById(id).populate('store')
    .populate('category');

  if(!item ){
    throw new Error('Item not found');
  }

  return item ;
};

export const currency = (string)=>{
  const toNumber = parseInt(string.replace(/\D/g, ''));

  if(isNaN(toNumber)){
    return '';
  }

  return toNumber.toLocaleString();
};
