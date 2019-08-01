const graphql = require('graphql');/* eslint-disable-line no-undef */
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import User from '../../models/user';
import { RoleType, roleExists } from './roles';
import Role from '../../models/role';
import { StoreType } from './store';
import { StoreCategoryType } from './storeCategory';

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLList
} = graphql;

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    password: { type: GraphQLString },
    confirmPassword: { type: GraphQLString },
    isVerified: { type: GraphQLBoolean },
    createdAt:   { type: GraphQLString },
    updatedAt:  { type: GraphQLString },
    stores: { type: new GraphQLList(StoreType) },
    categories: { type: new GraphQLList(StoreCategoryType) },
    role: {
      type:RoleType,
      resolve(parent, args){
        return Role.findOne({ _id: parent.role });
      }
    },
    host:{ type: GraphQLString }
  })
});

export const userArgs = {
  firstName: { type: new GraphQLNonNull(GraphQLString) },
  lastName: { type: new GraphQLNonNull(GraphQLString) },
  email: { type: new GraphQLNonNull(GraphQLString) },
  phoneNumber: { type: new GraphQLNonNull(GraphQLString) },
  password: { type: new GraphQLNonNull(GraphQLString) },
  confirmPassword: { type: new GraphQLNonNull(GraphQLString) },
  role: { type: new GraphQLNonNull(GraphQLString) },
  isVerified: { type: GraphQLBoolean },
  host:{ type: GraphQLString },
  createdAt:  { type: GraphQLString },
  updatedAt:  { type: GraphQLString },
};

const Validate =(args)=>{
  const { password, email, confirmPassword, firstName, lastName, phoneNumber } = args;

  if (password!=confirmPassword){
    throw new Error ('Passwords do not match');
  }
  if (password.trim().length<6 ){
    throw new Error ('Password should have a minimum of 6 characters');
  }
  if (password.trim().length>40 || firstName.trim().length>40 || lastName.trim().length>40 ||email.trim().length>50 ){
    throw new Error ('fields should have a maximum of 40 characters');
  }
  if ( phoneNumber.trim().length!=10){
    throw new Error ('Invalid phone number');
  }
};

const sendEmail =(result,args, req )=>{
  const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,/* eslint-disable-line no-undef */
      pass: process.env.EMAIL_PASWORD,/* eslint-disable-line no-undef */
    }
  });

  const secretKey  = process.env.SECRET_KEY;/* eslint-disable-line no-undef */

  jwt.sign({ userId:result.id }, secretKey, { expiresIn: '24h' }, async(err,token)=>{
    const  link = args.host? `${args.host}/verify/${token}` :`http://${req.headers.host}/verify/${token}`;

    const  mailOptions={
      to : result.email,
      subject : 'Katale Email Verification',
      html : `Hello ${result.firstName} ,<br> Thanks for joining Katale.
                    Please Click on the link to verify your email.
                    <br> This link will expire after 24 hours.
                    <br><a href=${link}>Click here to verify</a>`
    };

    await smtpTransport.sendMail(mailOptions, (error, response)=>{
      if(error){
        throw new Error(error);
      }
    });

  });
};

export const addUser =  async (args ,req)=> {
  await Validate(args);

  return  User.findOne({ email: args.email })
    .then(async (user)=>{
      if (user){
        throw new Error('Email already exists');
      }

      await  roleExists(args.role);

      const hashed = await bcrypt.hash(args.password, 12);

      if(hashed){
        const user = new User({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phoneNumber: args.phoneNumber,
          password: hashed,
          isVerified: false,
          roleId: args.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const result  = await user.save();
        result.password=null;

        await sendEmail(result,args,req);

        return result;
      }
      return new Error ('Something went wrong');
    })
    .catch((error)=>{
      throw error;
    });
};

export const LoginType = new GraphQLObjectType({
  name: 'Login',
  fields: () => ({
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    token: { type: GraphQLString },
    user: { type: UserType }
  })
});

export const authArgs = {
  email: { type: new GraphQLNonNull(GraphQLString) },
  password: { type: new GraphQLNonNull(GraphQLString) },
};

export const loginUser =async (args)=>{
  const secretKey  = process.env.SECRET_KEY;/* eslint-disable-line no-undef */

  const user = await User.findOne({ email: args.email });
  if (!user.isVerified){
    throw new Error('Please check your email and verify your account.');
  }

  if (!user){
    throw new Error('Wrong email or password');
  }

  const isEqual = await bcrypt.compare(args.password, user.password);

  if (!isEqual){
    throw new Error('Wrong email or password');
  }

  user.password = null;

  const token = await jwt.sign({ userId:user.id, email:user.email, firstName:user.firstName }, secretKey, { expiresIn: '24h' });
  return { token , user };
};
