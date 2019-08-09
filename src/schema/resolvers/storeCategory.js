const graphql = require('graphql');/* eslint-disable-line no-undef */
import StoreCategory from '../../models/StoreCategory';
import { getUser } from '../../helpers/user';
import { UserType } from './user';
import { StoreType } from './store';
import { getStoreCategory } from '../../helpers/store';
import { titleCase } from '../../helpers/formatData';

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList
} = graphql;

export const StoreCategoryType = new GraphQLObjectType({
  name: 'StoreCategory',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    createdBy: { type: UserType },
    stores:  { type: new GraphQLList(StoreType) },
    createdAt:   { type: GraphQLString },
    updatedAt:  { type: GraphQLString },
  })
});

export const storeCategoryArgs = {
  id: { type: GraphQLID },
  name: { type: new GraphQLNonNull(GraphQLString) },
  createdAt:  { type: GraphQLString },
  updatedAt:  { type: GraphQLString },
};

export const addStoreCategory = async(args,req)=>{
  const user = await getUser(req.user.userId);
  const storeCategory = await StoreCategory.findOne({ name: await titleCase(args.name) });
  if(storeCategory){
    throw new Error('Category already exists');
  }

  const category = new StoreCategory({
    name: await titleCase(args.name),
    createdBy:user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const result  = await category.save();

  user.categories.push(category);
  const newUser = await user.save();

  newUser.password = null;
  result.createdBy=newUser;

  return result;
};

export const updateStoreCategory = async(args,req)=>{
  const user = await getUser(req.user.userId);
  const category = await getStoreCategory(args.id);

  if (user.id != category.createdBy.id){

    throw new Error('Not authorized');
  }
  const categoryExists = await StoreCategory.findOne({ name: await titleCase(args.name) });

  if(categoryExists){
    throw new Error('Category already exists');
  }

  return StoreCategory.findByIdAndUpdate(args.id, {
    $set:{ name: await titleCase(args.name),updatedAt: new Date() } },
  { new:true,useFindAndModify: false }, ( err,category)=>{
    if (err){
      throw new Error(err);
    }
    return category;
  }
  );
};

export const deleteStoreCategory = async(args,req)=>{
  const user = await getUser(req.user.userId);
  const category = await getStoreCategory(args.id);

  if (user.id != category.createdBy.id){
    throw new Error('Not authorized');
  }

  if(category.stores.length>0){
    throw new Error('You can not delete a category with stores');
  }

  const deleted = await StoreCategory.findByIdAndDelete(args.id);
  return deleted;
};
