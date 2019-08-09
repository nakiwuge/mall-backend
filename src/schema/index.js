const graphql = require('graphql');/* eslint-disable-line no-undef */
import { userArgs, addUser, UserType, LoginType, authArgs, loginUser,   } from './resolvers/user';
import User from '../models/user';
import { verifyUser, VerifyType, forgotPassword, sendPasswordEmail, forgotPasswordType, } from './resolvers/verify';
import Role from '../models/role';
import { RoleType, addRole } from './resolvers/roles';
import { addStoreCategory, StoreCategoryType, storeCategoryArgs,  } from './resolvers/storeCategory';
import StoreCategory from '../models/StoreCategory';
import { store, addStoreMutation, stores, updateStoreMutation, deleteStoreMutation } from './mutationsQueries/store';
import { updateStoreCategoryMutation, deleteStoreCategoryMutation } from './mutationsQueries/storeCategory';
import { getUser } from '../helpers/user';
import { getStoreCategory } from '../helpers/store';
import {
  itemCategories,
  addItemCategoryMutation,
  itemCategory,
  updateItemCategoryMutation,
  deleteItemCategoryMutation,
} from './mutationsQueries/itemCategory';
import { items,
  addItemMutation,
  item,
  updateItemMutation,
  deleteItemMutation
} from './mutationsQueries/item';

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({

    addUser: {
      type: UserType,
      args: userArgs,
      async resolve(parent,args, req){
        return addUser(args, req);
      }
    },
    verifyUser: {
      type: VerifyType,
      args: { token: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parent,args){
        return verifyUser(args);
      }
    },
    changePassword: {
      type: forgotPasswordType,
      args: { password: { type: new GraphQLNonNull(GraphQLString) }, confirmPassword: { type: new GraphQLNonNull(GraphQLString) }, token: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parent,args){
        return forgotPassword(args);
      }
    },
    addRole: {
      type: RoleType,
      args: { name: { type: new GraphQLNonNull(GraphQLString) }, createdAt: { type: GraphQLString }, updatedAt: { type: GraphQLString } },
      resolve(parent,args){
        return addRole(args);
      }
    },

    addStoreCategory: {
      type: StoreCategoryType,
      args: storeCategoryArgs,
      resolve(parent,args,req){
        if(!req.isAuth){
          throw new Error('not authenticated');
        }
        if(req.role === 'superAdmin' || req.role === 'admin'){
          return addStoreCategory(args,req);
        }
        throw new Error('not authorized');
      }
    },
    addStore: addStoreMutation,
    updateStore: updateStoreMutation,
    deleteStore: deleteStoreMutation,
    updateStoreCategory: updateStoreCategoryMutation,
    deleteStoreCategory: deleteStoreCategoryMutation,
    //items
    addItemCategory:addItemCategoryMutation,
    updateItemCategory:updateItemCategoryMutation,
    deleteItemCategory:deleteItemCategoryMutation,
    addItem:addItemMutation,
    updateItem:updateItemMutation,
    deleteItem:deleteItemMutation
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields:{
    user:{
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve(parent,args){
        const user = await getUser(args.id);
        user.password= null;
        return user;
      }
    },
    users:{
      type: new GraphQLList(UserType),
      async resolve(){
        const users = await User.find().populate('stores');
        await users.map((user)=>{
          user.password = null;
        });
        return users;
      }
    },
    login: {
      type: LoginType,
      args:  authArgs,
      resolve(parent,args){
        return loginUser(args);
      }
    },
    sendPasswordEmail: {
      type: forgotPasswordType,
      args: { email: { type: new GraphQLNonNull(GraphQLString) },
        host: { type: GraphQLString } },
      resolve(parent,args, req){
        return sendPasswordEmail(args, req);
      }
    },

    roles:{
      type: new GraphQLList(RoleType),
      resolve(){
        return Role.find();
      }
    },
    role:{
      type: RoleType,
      args: { id: { type: GraphQLID } },
      resolve(parent,args){
        return Role.findById(args.id);
      }
    },
    storeCategories:{
      type: new GraphQLList(StoreCategoryType),
      async resolve(){

        return StoreCategory.find().populate('createdBy', '-password').populate('stores');
      }
    },
    storeCategory:{
      type: StoreCategoryType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args){
        return getStoreCategory(args.id);
      }
    },
    stores,
    store,
    itemCategories,
    itemCategory,
    items,
    item
  }
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

export default schema;