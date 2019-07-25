import Role from '../models/role';
import User from '../models/user';

const checkRole = async (req,res,next)=>{
  if (!req.user){
    req.role=null;
    return next();
  }

  const user = await User.findOne({ _id:req.user.userId } );

  if (!user){
    req.userRole=null;
    return next();
  }

  const result = await Role.findOne({ _id:user.role });

  if(!result){
    req.userRole=null;
    return next();
  }

  req.role=result.name;
  return next();
};

export default checkRole;
