const { ManagementClient } = require('auth0');

const managementClient = new ManagementClient({
  clientId: process.env.AUTH_MANAGEMENT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
  scope: 'read:users'
});

const parseUser = user => ({
  email: user.name,
  displayName: user.nickname,
  id: user.sub,
  image: user.picture
});

const getUser = id => {
  return managementClient.getUser({ id })
    .then(user => parseUser(user));
};

const getUsers = ids => {
  managementClient.getUsers({ 
    q: `user_id: ${ids.join(' OR ')}`
  })
    .then(users => users.map(user => parseUser(user)));
};

const joinUsers = async(models, field = 'user') => {
  const usersId = [...new Set(models.map(model => model[field]))];
  const users = await getUsers(usersId);
  const modelsWithUsers = models.map(model => ({
    ...model.toJSON(),
    [field]: users.find(user => user.id === model[field])
  }));
  return modelsWithUsers;
};

module.exports = {
  getUser,
  getUsers,
  joinUsers
};
