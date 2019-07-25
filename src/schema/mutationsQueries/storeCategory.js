const graphql = require('graphql');/* eslint-disable-line no-undef */

import { StoreCategoryType, storeCategoryArgs,
  updateStoreCategory, deleteStoreCategory } from '../resolvers/storeCategory';

const {
  GraphQLNonNull,
  GraphQLString,
} = graphql;

export const updateStoreCategoryMutation = {
  type: StoreCategoryType,
  args: storeCategoryArgs,
  resolve(parent,args,req){
    if(!req.isAuth){
      throw new Error('not authenticated');
    }
    return updateStoreCategory(args,req);
  }
};
export const deleteStoreCategoryMutation = {
  type: StoreCategoryType,
  args: { id: { type: new GraphQLNonNull( GraphQLString) } },
  resolve(parent,args,req){
    if(!req.isAuth){
      throw new Error('not authenticated');
    }
    return deleteStoreCategory(args,req);
  }
};