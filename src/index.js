import express from 'express';
import graphqlHTTP from 'express-graphql';
import  mongoose from 'mongoose';
import schema from './schema';
import bodyParser from 'body-parser';
import  dotenv from  'dotenv';
import cors from 'cors';
import verifyToken from './middlewares/verifyToken';
import checkRole from './middlewares/checkRole';
import { upload } from './middlewares/multer';
import fileUpload from './helpers/fileUpload';
import { cloudinaryConfig } from './config/cloudinary';

/* eslint-disable import/first */
dotenv.config();

/* eslint-disable-next-line no-undef */
const port = process.env.PORT || 4000;
const startServer = async ()=>{
  const app = express();
  app.use('*', cloudinaryConfig);
  app.use(cors());
  app.use( bodyParser.json());

  /* eslint-disable-next-line no-undef */
  await  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }, (err)=>{ /* eslint-disable no-undef */
    if (!err) console.log('MongoDB has connected successfully');
  });
  app.use(verifyToken);
  app.use(checkRole);

  app.post('/graphql/upload',upload, fileUpload);

  app.use('/graphql',

    graphqlHTTP(async () => {
      return {
        schema,
        graphiql: true,
      };
    }));

  app.listen(port, () => {
    console.log('now listening for requests on port ' +port);
  });
};
startServer();
