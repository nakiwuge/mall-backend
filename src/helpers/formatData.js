export const capitalize = (string)=>{

  return string.trim().charAt(0).toUpperCase() + string.slice(1);
};

export const titleCase = async (string)=>{
  let newTitle=[];
  const splitString = string.trim().split(' ');

  if (splitString.length==1){

    return string.trim().charAt(0).toUpperCase() + string.slice(1);
  }

  await splitString.map((str)=>{
    newTitle.push(str.charAt(0).toUpperCase() + str.slice(1));
  });

  return newTitle.join(' ');
};