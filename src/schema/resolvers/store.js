const graphql = require('graphql');/* eslint-disable-line no-undef */
import { getUser } from '../../helpers/user';
import { UserType } from './user';
import Store from '../../models/store';
import { StoreCategoryType } from './storeCategory';
import { getStoreCategory, getStore } from '../../helpers/store';
import User from '../../models/user';
import StoreCategory from '../../models/StoreCategory';

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
} = graphql;

export const StoreType = new GraphQLObjectType({
  name: 'Store',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    owner: { type: UserType },
    category: { type: StoreCategoryType },
    description: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    createdAt:   { type: GraphQLString },
    updatedAt:  { type: GraphQLString },
  })
});

export const storeArgs = {
  id: { type: GraphQLString },
  name: { type: new GraphQLNonNull(GraphQLString) },
  owner: { type: GraphQLString },
  category: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) },
  imageUrl: { type: GraphQLString },
  createdAt:   { type: GraphQLString },
  updatedAt:  { type: GraphQLString },
};

export const addStore = async(args,req)=>{
  const { userId } = req.user;
  const user = await getUser(userId);
  const category = await getStoreCategory(args.category);

  const store = new Store({
    name: args.name,
    owner: user.id,
    category: args.category,
    description: args.description,
    imageUrl: args.imageUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const result  = await store.save();

  user.stores.push(store);
  const newUser = await user.save();
  category.stores.push(store);
  const newCategory = await category.save();

  newUser.password=null;
  result.owner=newUser;
  result.category=newCategory;

  return result ;
};

export const updateStore = async(args,req)=>{
  const user = await getUser(req.user.userId);
  const store = await getStore(args.id);

  if (user.id != store.owner){

    throw new Error('Not authorized');
  }

  return Store.findByIdAndUpdate(args.id, {
    $set:{ name: args.name,
      category: args.category,
      description: args.description,
      imageUrl: args.imageUrl,
      updatedAt: new Date() } },
  { new:true,useFindAndModify: false }, ( err,store)=>{
    if (err){
      throw new Error(err);
    }
    return store;
  }
  );
};

export const deleteStore = async(args,req)=>{
  const user = await getUser(req.user.userId);
  const store = await getStore(args.id);

  if (user.id != store.owner){
    throw new Error('Not authorized');
  }

  return  Store.findById(args.id, async(err, store)=>{
    if (err){
      throw new Error(err);
    }

    store.remove();

    await User.updateOne({ _id:user.id },{ $pull: { stores: { $in: [ args.id ] } } });
    await StoreCategory.updateOne({ _id:store.category },{ $pull: { stores: { $in: [ args.id ] } } });

    return store;
  });

};
