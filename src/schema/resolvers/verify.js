const graphql = require('graphql');/* eslint-disable-line no-undef */
import jwt from 'jsonwebtoken';
import User from '../../models/user';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const { GraphQLObjectType,GraphQLString } = graphql;

export const VerifyType = new GraphQLObjectType({
  name: 'Verify',
  fields: () => ({
    token: { type: GraphQLString },
    verifiedUser:{ type: GraphQLString }
  })
});

export const decodeToken= (args)=>{
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

export const forgotPasswordType = new GraphQLObjectType({
  name: 'forgotPassword',
  fields: () => ({
    user:{ type: GraphQLString },
  })
});

export const forgotPassword =async (args)=>{
  const userId = await decodeToken(args);
  const hashed = await bcrypt.hash(args.password, 12);

  if (args.password !== args.confirmPassword){
    throw new Error('Passwords do not match');
  }

  if (args.password.trim().length<6 ){
    throw new Error ('Password should have a minimum of 6 characters');
  }

  if (args.password.trim().length>40 ){
    throw new Error ('fields should have a maximum of 40 characters');
  }

  return  User.findOneAndUpdate(
    { _id: userId },
    { $set:{ password :hashed } },
    { new:true,useFindAndModify: false }, )
    .then( user => {
      return { user:user.id };
    })
    .catch((error)=>{
      throw error;
    });
};

export const sendPasswordEmail = async(args, req)=>{
  const user = await User.findOne({ email: args.email });

  if (!user){
    throw new Error('Email does not exist');
  }

  if(user){
    if (!user.isVerified){
      throw new Error('Please check your email and verify your account.');
    }
  }

  const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,/* eslint-disable-line no-undef */
      pass: process.env.EMAIL_PASWORD,/* eslint-disable-line no-undef */
    }
  });

  const secretKey  = process.env.SECRET_KEY;/* eslint-disable-line no-undef */
  const token =  await jwt.sign({ userId:user.id }, secretKey, { expiresIn: '24h' });

  if(!token){
    throw new Error('Something went wrong please try again later');
  }

  const  link = args.host? `${args.host}/reset-password/${token}` :`http://${req.headers.host}/verify/${token}`;
  const  mailOptions={
    to : user.email,
    subject : 'Katale Password Reset',
    html : `Hello ${user.firstName} ,<br> You are seeing this email because you requested to change your password.
                          Please Click on the link to reset your password.
                          <br> This link will expire after 24 hours.
                          <br><a href=${link}>Click here to reset your password</a>`
  };
  const success = await smtpTransport.sendMail(mailOptions);

  if(success){
    return ({ user:user.id });
  }
  throw new Error('Something went wrong please try again later');
};
