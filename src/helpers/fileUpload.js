import { uploader } from '../config/cloudinary';
import { dataUri } from '../middlewares/multer';

const fileUpload = async(req, res)=>{
  if(req.file){
    const file = dataUri(req).content;
    const result = await uploader.upload(file);

    if (!result){
      return res.status(400).send({ message:'failed' });
    }

    return res.status(200).send({
      data:result.url,
      message:'success'
    });
  }

  return res.status(400).send({ message:'failed' });

};
export default fileUpload;
