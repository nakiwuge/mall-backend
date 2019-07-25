const graphql = require('graphql');/* eslint-disable-line no-undef */

import { addStore, storeArgs, StoreType, updateStore, deleteStore } from '../resolvers/store';
import Store from '../../models/store';
import { getStore } from '../../helpers/store';

const {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} = graphql;

export const addStoreMutation = {
  type: StoreType,
  args: storeArgs,
  resolve(parent,args,req){
    if(!req.isAuth){
      throw new Error('not authenticated');
    }
    if(req.role === 'buyer'){
      throw new Error('not authorized');
    }
    return addStore(args,req);
  }
};

export const stores = {
  type: new GraphQLList(StoreType),
  resolve(){
    return Store.find().populate('owner', '-password')
      .populate('category');
  }
};
export const store = {
  type: StoreType,
  args: { id: { type: GraphQLID } },
  resolve(parent,args){
    return getStore(args.id);
  }
};

export const updateStoreMutation = {
  type: StoreType,
  args: storeArgs,
  resolve(parent,args,req){
    if(!req.isAuth){
      throw new Error('not authenticated');
    }
    return updateStore(args,req);
  }
};
export const deleteStoreMutation = {
  type: StoreType,
  args: { id: { type: new GraphQLNonNull( GraphQLString) } },
  resolve(parent,args,req){
    if(!req.isAuth){
      throw new Error('not authenticated');
    }
    return deleteStore(args,req);
  }
};
