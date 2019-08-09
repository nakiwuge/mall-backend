const graphql = require('graphql');/* eslint-disable-line no-undef */
import { getUser } from '../../helpers/user';
import { UserType } from './user';
import { getItemCategory } from '../../helpers/item';
import ItemCategory from '../../models/itemCategory';
import { ItemType } from './item';
import { titleCase } from '../../helpers/formatData';

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList
} = graphql;

export const ItemCategoryType = new GraphQLObjectType({
  name: 'ItemCategory',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    createdBy: { type: UserType },
    items:  { type: new GraphQLList(ItemType) },
    createdAt:   { type: GraphQLString },
    updatedAt:  { type: GraphQLString },
  })
});

export const itemCategoryArgs = {
  id: { type: GraphQLID },
  name: { type: new GraphQLNonNull(GraphQLString) },
  createdAt:  { type: GraphQLString },
  updatedAt:  { type: GraphQLString },
};

export const addItemCategory = async(args,req)=>{
  const user = await getUser(req.user.userId);
  const itemCategory = await ItemCategory.findOne({ name: args.name });

  if(itemCategory){
    throw new Error('Category already exists');
  }

  const category = new ItemCategory({
    name: await titleCase(args.name),
    createdBy:user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const result  = await category.save();

  user.password = undefined;
  result.createdBy=user;

  return result;
};

export const updateItemCategory = async(args,req)=>{

  const categoryExists = await ItemCategory.findOne({ name: args.name });

  if(categoryExists){
    throw new Error('Category already exists');
  }

  return ItemCategory.findByIdAndUpdate(args.id, {
    $set:{ name: await titleCase(args.name),updatedAt: new Date() } },
  { new:true,useFindAndModify: false }, ( err,category)=>{
    if (err){
      throw new Error(err);
    }
    return category;
  }
  );
};

export const deleteItemCategory = async(args,req)=>{
  const category = await getItemCategory(args.id);
  const categoryExists = await ItemCategory.findOne({ name: args.name });

  if(categoryExists){
    throw new Error('Category already exists');
  }

  if(category.items.length>0){
    throw new Error('You can not delete a category with items');
  }

  const deleted = await ItemCategory.findByIdAndDelete(args.id);

  return deleted;
};
