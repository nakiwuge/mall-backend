const graphql = require('graphql');/* eslint-disable-line no-undef */

import ItemCategory from '../../models/itemCategory';
import { itemCategoryArgs,
  ItemCategoryType,
  addItemCategory,
  updateItemCategory,
  deleteItemCategory } from '../resolvers/itemCategory';
import { getItemCategory } from '../../helpers/item';

const {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} = graphql;

export const addItemCategoryMutation = {
  type: ItemCategoryType,
  args: itemCategoryArgs,
  resolve(parent,args,req){
    const roles = ['superAdmin', 'admin'];

    if(!req.isAuth){
      throw new Error('not authenticated');
    }

    if(!roles.includes(req.role)){
      throw new Error('not authorized');
    }
    return addItemCategory(args,req);
  }
};

export const itemCategories = {
  type: new GraphQLList(ItemCategoryType),
  resolve(){
    return ItemCategory.find().populate('createdBy', '-password')
      .populate('items');
  }
};

export const itemCategory = {
  type: ItemCategoryType,
  args: { id: { type: GraphQLID } },
  resolve(parent,args){
    return getItemCategory(args.id);
  }
};

export const updateItemCategoryMutation = {
  type: ItemCategoryType,
  args: itemCategoryArgs,
  resolve(parent,args,req){
    const roles = ['superAdmin', 'admin'];

    if(!req.isAuth){
      throw new Error('not authenticated');
    }

    if(!roles.includes(req.role)){
      throw new Error('not authorized');
    }
    return updateItemCategory(args,req);
  }
};

export const deleteItemCategoryMutation = {
  type: ItemCategoryType,
  args: { id: { type: new GraphQLNonNull( GraphQLString) } },
  resolve(parent,args,req){
    const roles = ['superAdmin', 'admin'];

    if(!req.isAuth){
      throw new Error('not authenticated');
    }
    
    if(!roles.includes(req.role)){
      throw new Error('not authorized');
    }
    return deleteItemCategory(args,req);
  }
};
