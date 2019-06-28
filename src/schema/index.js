const graphql = require('graphql');/* eslint-disable-line no-undef */
import { userArgs, addUser, UserType, LoginType, authArgs, loginUser,   } from './resolvers/user';
import User from '../models/user';
import { verifyUser, VerifyType, forgotPassword, sendPasswordEmail, forgotPasswordType, } from './resolvers/verify';

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
    sendPasswordEmail: {
      type: forgotPasswordType,
      args: { email: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parent,args, req){
        return sendPasswordEmail(args, req);
      }
    },
    changePassword: {
      type: forgotPasswordType,
      args: { password: { type: new GraphQLNonNull(GraphQLString) }, confirmPassword: { type: new GraphQLNonNull(GraphQLString) }, token: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parent,args){
        return forgotPassword(args);
      }
    },
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields:{
    user:{
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent,args){
        return User.findById(args.id);
      }
    },
    users:{
      type: new GraphQLList(UserType),
      resolve(){
        return User.find({});
      }
    },
    login: {
      type: LoginType,
      args:  authArgs,
      resolve(parent,args){
        return loginUser(args);
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation

});

export default schema;