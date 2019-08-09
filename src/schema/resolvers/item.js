const graphql = require('graphql');/* eslint-disable-line no-undef */
import { getUser } from '../../helpers/user';
import Store from '../../models/store';
import { getStore } from '../../helpers/store';
import deleteFile from '../../helpers/deleteFile';
import { StoreType } from './store';
import { ItemCategoryType } from './itemCategory';
import { getItemCategory, getItem } from '../../helpers/item';
import Item from '../../models/items';
import { titleCase, capitalize } from '../../helpers/formatData';
import ItemCategory from '../../models/itemCategory';

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLBoolean
} = graphql;

export const ItemType = new GraphQLObjectType({
  name: 'Item',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    store: { type: StoreType },
    category: { type: ItemCategoryType },
    description: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    price:{ type: GraphQLString },
    negotiable:{ type: GraphQLBoolean },
    createdAt:   { type: GraphQLString },
    updatedAt:  { type: GraphQLString },
  })
});

export const itemArgs = {
  id: { type: GraphQLString },
  name: { type: new GraphQLNonNull(GraphQLString) },
  store: { type: new GraphQLNonNull(GraphQLString) },
  category: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) },
  price:{ type: new GraphQLNonNull(GraphQLString) },
  negotiable:{ type: new GraphQLNonNull(GraphQLBoolean) },
  imageUrl: { type: GraphQLString },
  createdAt:   { type: GraphQLString },
  updatedAt:  { type: GraphQLString },
};

export const addItem  = async(args,req)=>{
  const { userId } = req.user;
  const user = await getUser(userId);
  const store = await getStore(args.store);
  const category = await getItemCategory(args.category);

  if (user.id != store.owner.id){
    throw new Error('Not authorized');
  }

  const item = new Item({
    name: await titleCase(args.name),
    store: store.id,
    category: category.id,
    description: capitalize(args.description),
    price:args.price,
    negotiable:args.negotiable,
    imageUrl: args.imageUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const result  = await item.save();

  category.items.push(item);
  category.save();
  store.items.push(item);
  store.save();

  return result ;
};

export const updateItem = async(args,req)=>{
  const user = await getUser(req.user.userId);
  const item = await  getItem(args.id);
  await getItemCategory(args.category);

  if (user.id != item.store.owner){
    throw new Error('Not authorized');
  }

  return Item.findByIdAndUpdate(args.id, {
    $set:{ name:await titleCase(args.name),
      category: args.category,
      description: capitalize(args.description),
      price:args.price,
      negotiable:args.negotiable,
      imageUrl: args.imageUrl,
      updatedAt: new Date() } },
  { new:true,useFindAndModify: false }, ( err,item)=>{
    if (err){
      throw new Error(err);
    }
    return item;
  }
  );
};

export const deleteItem= async(args,req)=>{
  const user = await getUser(req.user.userId);
  const item = await  getItem(args.id);

  if (user.id != item.store.owner){
    throw new Error('Not authorized');
  }

  return  Item.findById(args.id, async(err, item)=>{
    if (err){
      throw new Error(err);
    }

    item.remove();
    if(item.imageUrl!=='null'){
      deleteFile(item.imageUrl);
    }

    await Store.updateOne({ _id:args.store },{ $pull: { items: { $in: [ args.id ] } } });
    await ItemCategory.updateOne({ _id:args.category },{ $pull: { items: { $in: [ args.id ] } } });

    return item;
  });

};
