const graphql = require('graphql');/* eslint-disable-line no-undef */
import Role from '../../models/role';

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
} = graphql;

export const RoleType = new GraphQLObjectType({
  name: 'Role',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    createdAt:   { type: GraphQLString },
    updatedAt:  { type: GraphQLString },
  })
});

export const roleExists = (roleId) => {
  return  Role.findOne({ _id: roleId }).then((role)=>{
    if (!role){
      throw new Error('Role does not exist');
    }
  }).catch((error)=>{
    throw error;
  });
};

export const addRole = (args)=>{

  return  Role.findOne({ name: args.name })
    .then(async (role)=>{
      if (role){
        throw new Error('Role already exists');
      }
      const newRole = new Role({
        name: args.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const result  = await newRole.save();

      return result;

    })
    .catch((error)=>{
      throw error;
    });
};

