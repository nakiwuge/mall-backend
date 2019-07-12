import jwt from 'jsonwebtoken';

const verifyToken = (req,res,next)=>{
  const header = req.headers['authorization'];
  if (typeof header === 'undefined'){
    req.isAuth = false;
    return next();
  }
  const bearer = header.split(' ');
  const token = bearer[1];
  req.token = token;
  const secretKey  = process.env.SECRET_KEY;/* eslint-disable-line no-undef */
  return  jwt.verify(req.token, secretKey, (err, user)=>{
    if(err){
      req.isAuth = false;
      return  next();
    } else {
      req.user = user;
      req.isAuth = true;
      return  next();
    }
  });

};
export default verifyToken;