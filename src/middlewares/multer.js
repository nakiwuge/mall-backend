import multer from 'multer';
import Datauri from 'datauri';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) =>{
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'  || file.mimetype === 'image/png'){
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerUploads = multer({
  storage,
  limits: {
    filesize: 1024 * 1024 * 2
  },
  fileFilter: fileFilter
});

const upload = multerUploads.single('imageUrl');

const dUri = new Datauri();
const dataUri = req => dUri.format(
  path.extname(req.file.originalname).toString(),
  req.file.buffer);

export { upload, dataUri }  ;