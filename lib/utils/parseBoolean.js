module.exports = function parseBoolean(obj) {
  let newObj = {};

  if(obj.dairy){
    newObj.dairy = true;
  }
  if(obj.gluten){
    newObj.gluten = true;
  }
  if(obj.nut){
    newObj.nut = true;
  }
  if(obj.vegetarian){
    newObj.vegetarian = true;
  }
  if(obj.vegan){
    newObj.vegan = true;
  }
  if(obj.shellfish){
    newObj.shellfish = true;
  }

  const parsed = Object.keys(newObj).reduce((acc, key)=>{
    acc[`dietary.${key}`] = newObj[key];
    return acc;
  }, {});

  return parsed;
};
