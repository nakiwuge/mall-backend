import { uploader } from '../config/cloudinary';

const deleteFile=(url)=>{
  const splitUrl = url.split('/');
  const name =splitUrl[splitUrl.length-1].split('.')[0];

  try{
    uploader.destroy(name, ({ result })=> {
      if(result==='ok'){
        return true;
      }
      return false;

    });}
  catch(err){
    return false;
  }
};

export default deleteFile;
