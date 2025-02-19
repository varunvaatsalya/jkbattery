const { getUsers, saveUser, updateUser } = require("./db/users");

const handlers = {
  "save-user": async (data) => {
    return { success: true, id: await saveUser(data) };
  },
  "get-users": async () => {
    return { success: true, data: await getUsers() };
  },
  "update-user": async (data) => {
    return { success: true, updated: await updateUser(data) };
  },
  // "delete-user": async (data) => {
  //   return { success: true, deleted: await deleteUser(data.id) };
  // },
};

module.exports = { handlers };
