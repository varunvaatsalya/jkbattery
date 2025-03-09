const {
  updateCompany,
  saveCompany,
  getCompanies,
  getCompaniesWithProducts,
} = require("./db/company");
const { saveComplaint, fetchComplaints, updateComplaint } = require("./db/complaint.js");
const { saveCustomer, getCustomers, updateCustomer, findCustomers } = require("./db/customers");
const { saveDealer, getDealers, updateDealer, findDealers } = require("./db/dealers.js");
const { saveEmployee, getEmployees, updateEmployee } = require("./db/employee");
const { saveLogin, getAllLogins } = require("./db/loginsHistory.js");
const { saveProduct, getProducts, updateProduct } = require("./db/products");
const { saveType, getTypes, deleteType } = require("./db/types");
const { getUsers, saveUser, updateUser } = require("./db/users");

const handlers = {
  "save-user": async (data) => {
    return await saveUser(data);
  },
  "get-users": async () => {
    return await getUsers();
  },
  "update-user": async (data) => {
    return await updateUser(data);
  },
  "save-employee": async (data) => {
    return await saveEmployee(data);
  },
  "get-employees": async () => {
    return await getEmployees();
  },
  "update-employee": async (data) => {
    return await updateEmployee(data);
  },
  "save-customer": async (data) => {
    return await saveCustomer(data);
  },
  "get-customers": async () => {
    return await getCustomers();
  },
  "find-customers": async (data) => {
    return await findCustomers(data);
  },
  "update-customer": async (data) => {
    return await updateCustomer(data);
  },
  "save-dealer": async (data) => {
    return await saveDealer(data);
  },
  "get-dealers": async () => {
    return await getDealers();
  },
  "find-dealers": async (data) => {
    return await findDealers(data);
  },
  "update-dealer": async (data) => {
    return await updateDealer(data);
  },
  "save-company": async (data) => {
    return await saveCompany(data);
  },
  "get-companies": async () => {
    return await getCompanies();
  },
  "get-companies-with-products": async () => {
    return await getCompaniesWithProducts();
  },
  "update-company": async (data) => {
    return await updateCompany(data);
  },
  "save-type": async (data) => {
    return await saveType(data);
  },
  "get-types": async () => {
    return await getTypes();
  },
  "delete-type": async (data) => {
    return await deleteType(data);
  },
  "save-product": async (data) => {
    return await saveProduct(data);
  },
  "get-products": async () => {
    return await getProducts();
  },
  "update-product": async (data) => {
    return await updateProduct(data);
  },
  "save-complaint": async (data, buffer,extension) => {
    return await saveComplaint(data, buffer, extension);
  },
  "update-complaint": async (data) => {
    return await updateComplaint(data);
  },
  "get-complaints": async (data) => {
    return await fetchComplaints(data);
  },
  "get-logins": async (data) => {
    return await getAllLogins(data);
  },
};

module.exports = { handlers };
