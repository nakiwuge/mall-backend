const graphql = require('graphql');/* eslint-disable-line no-undef */
import Item from '../../models/items';
import {  getItem } from '../../helpers/item';
import {
  ItemType,
  itemArgs,
  addItem,
  updateItem ,
  deleteItem } from '../resolvers/item';

const {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} = graphql;

export const addItemMutation = {
  type: ItemType,
  args: itemArgs,
  resolve(parent,args,req){
    const roles = ['superAdmin','admin','seller'];

    if(!req.isAuth){
      throw new Error('not authenticated');
    }
    if(!roles.includes(req.role)){
      throw new Error('not authorized');
    }
    return addItem(args,req);
  }
};

export const items = {
  type: new GraphQLList(ItemType),
  resolve(){
    return Item.find().populate('category')
      .populate('store');
  }
};
export const item = {
  type: ItemType,
  args: { id: { type: GraphQLID } },
  resolve(parent,args){
    return getItem(args.id);
  }
};

export const updateItemMutation = {
  type: ItemType,
  args: itemArgs,
  resolve(parent,args,req){

    if(!req.isAuth){
      throw new Error('not authenticated');
    }

    return updateItem(args,req);
  }
};

export const deleteItemMutation = {
  type: ItemType,
  args: { id: { type: new GraphQLNonNull( GraphQLString) } },
  resolve(parent,args,req){
    if(!req.isAuth){
      throw new Error('not authenticated');
    }

    return deleteItem(args,req);
  }
};
