const graphql = require('graphql');/* eslint-disable-line no-undef */
import jwt from 'jsonwebtoken';
import User from '../../models/user';

const { GraphQLObjectType,GraphQLString } = graphql;

export const VerifyType = new GraphQLObjectType({
  name: 'Verify',
  fields: () => ({
    token: { type: GraphQLString },
    verifiedUser:{ type: GraphQLString }
  })
});

const decodeToken= (args)=>{
  const secretKey  = process.env.SECRET_KEY;/* eslint-disable-line no-undef */
  let userId;
  jwt.verify(args.token, secretKey, (err, user)=>{
    if(err){
      throw new Error(err);
    } else {
      userId=user.userId;
    }
  });
  return userId;
};

export const verifyUser =  async (args)=> {
  const userId = await decodeToken(args);

  return  User.findOneAndUpdate(
    { _id: userId },
    { $set:{ isVerified:true } },
    { new:true,useFindAndModify: false }, )
    .then( user =>{
      return { verifiedUser:user.id };
    })
    .catch((error)=>{
      throw error;
    });
};
