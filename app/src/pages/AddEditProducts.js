import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { BiSolidAddToQueue } from "react-icons/bi";
import { LuCirclePlus } from "react-icons/lu";
import { TiPlus } from "react-icons/ti";
import { MdDelete } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { FaPen } from "react-icons/fa6";

function AddEditProducts() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [typesMessage, setTypesMessage] = useState("");
  const [type, setType] = useState("");
  const [isOpenAddTypeSection, setIsOpenAddTypeSection] = useState(false);
  const [openModalLoading, setOpenModalLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchCompanies = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-companies",
    });

    if (response.success) {
      setCompanies(response.data);
    } else {
      setMessage(`Error: ${response.error}`);
    }
    setTimeout(() => {
      setMessage("");
    }, 4500);
  };
  const fetchTypes = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-types",
    });

    if (response.success) {
      setTypes(response.data);
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };
  const fetchProducts = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-products",
    });

    if (response.success) {
      setProducts(response.data);
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveType = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "save-type",
      data: { name: type },
    });
    if (response.success) {
      setTypesMessage(`Type Saved`);
      fetchTypes();
    } else {
      setTypesMessage(`Error: ${response.message}`);
    }
    setTimeout(() => {
      setTypesMessage("");
      setType("");
      setIsOpenAddTypeSection(false);
    }, 2500);
  };
  const handleDeleteType = async (id) => {
    const response = await window.electron.invoke("database-operation", {
      action: "delete-type",
      data: { id },
    });
    if (response.success) {
      setTypesMessage(`Type Deleted`);
      fetchTypes();
    } else {
      setTypesMessage(`Error: ${response.message}`);
    }
    setTimeout(() => {
      setTypesMessage("");
    }, 2500);
  };

  useEffect(() => {
    if (isOpenModal) {
      setOpenModalLoading(true);
      fetchCompanies();
      fetchTypes();
      setOpenModalLoading(false);
    }
  }, [isOpenModal]);

  const handleSaveProduct = async (data) => {
    const response = await window.electron.invoke("database-operation", {
      action: editMode ? "update-product" : "save-product",
      data,
    });
    if (response.success) {
      setMessage(editMode ? "Product Update" : `Product Saved`);
      editMode ? fetchProducts() : setProducts([response.product, ...products]);
    } else {
      setMessage(`Error: ${response.message}`);
    }
    setTimeout(() => {
      reset();
      setMessage("");
      setEditMode(false);
      setIsOpenModal(false);
      setIsOpenAddTypeSection(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center max-h-screen h-screen">
      <Navbar route={["Product", "Add/Edit Product"]} />
      <div className="w-full my-1 px-2 md:px-4 lg:px-8 flex justify-between items-center">
        <div className="font-bold text-2xl text-pink-600">Products</div>
        <button
          onClick={() => setIsOpenModal(true)}
          className="px-4 py-1 rounded-full font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-2"
        >
          <BiSolidAddToQueue />
          <div>Add</div>
        </button>
      </div>
      {isOpenModal && (
        <div className="absolute top-0 left-0">
          <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
            <div className="w-[95%] md:w-4/5 lg:w-3/4 py-2 text-center bg-slate-200 px-4 rounded-xl">
              {openModalLoading ? (
                <>
                  <AiOutlineLoading3Quarters className="mx-auto size-8 animate-spin my-2" />
                </>
              ) : (
                <>
                  <h2 className="py-1 text-xl font-bold text-rose-900">
                    New Product
                  </h2>
                  <div className="text-center font-semibold text-red-500">
                    {message}
                  </div>
                  <hr className="border-t border-gray-400" />
                  <form
                    onSubmit={handleSubmit(handleSaveProduct)}
                    className="flex flex-col items-center gap-2 py-2"
                  >
                    <select
                      className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
                      {...register("company_id", {
                        required: true,
                      })}
                    >
                      <option value=""> -- Select Company -- </option>
                      {companies.map((Company, index) => (
                        <option key={index} value={Company.id}>
                          {Company.name}
                        </option>
                      ))}
                    </select>
                    <input
                      {...register("model_name", {
                        required: true,
                      })}
                      placeholder="Enter the Modal Name"
                      className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
                    />
                    <div className="w-1/2 flex justify-center items-center gap-2">
                      <select
                        className="p-2 w-full bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
                        {...register("product_type", {
                          required: true,
                        })}
                      >
                        <option value=""> -- Select Product Type -- </option>
                        {types.map((type, index) => (
                          <option key={index} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <div className="relative">
                        <div
                          className="p-2 bg-slate-300 hover:opacity-80 text-slate-600 rounded-lg cursor-pointer"
                          onClick={() =>
                            setIsOpenAddTypeSection(!isOpenAddTypeSection)
                          }
                        >
                          <TiPlus
                            className={isOpenAddTypeSection ? "rotate-45" : ""}
                          />
                        </div>
                        {isOpenAddTypeSection && (
                          <div className="absolute my-1 p-2 bg-slate-300 rounded-lg top-8 right-0 flex flex-col max-h-40">
                            <div className="text-sm font-semibold text-center text-pink-500">
                              Add New Type
                            </div>
                            <hr className="my-1 border-t border-slate-400" />
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="text"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                placeholder="Enter Type"
                                className="bg-slate-200 focus:bg-slate-100 text-sm font-semibold rounded-lg w-30 p-1 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                              />
                              <button
                                disabled={!type}
                                onClick={handleSaveType}
                                className="bg-pink-500 hover:bg-pink-600 cursor-pointer text-white p-1 rounded-lg"
                              >
                                <LuCirclePlus className="size-4" />
                              </button>
                            </div>
                            <div className="flex-1 p-2">
                              {typesMessage ? (
                                <div className="text-red-600 text-xs font-semibold">
                                  {typesMessage}
                                </div>
                              ) : types.length > 0 ? (
                                <div className="flex flex-col items-center gap-1">
                                  {types.map((type) => (
                                    <div
                                      key={type.id}
                                      className="flex items-center gap-1"
                                    >
                                      <div className="text-center p-1 font-semibold text-xs bg-slate-200 rounded-lg">
                                        {type.name}
                                      </div>
                                      <div
                                        onClick={() =>
                                          handleDeleteType(type.id)
                                        }
                                        className="p-1 bg-rose-300 text-rose-500 hover:text-rose-700 cursor-pointer rounded-lg"
                                      >
                                        <MdDelete />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-red-600 text-xs font-semibold">
                                  No Types are saved!
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="py-1 px-4 bg-rose-500 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                  <hr className="border-t border-gray-400" />
                  <button
                    onClick={() => {
                      setIsOpenModal(false);
                      setCompanies([]);
                      setEditMode(false);
                      reset();
                    }}
                    className="text-rose-500 hover:text-rose-600 font-semibold border border-rose-500 rounded-lg px-2 mt-1 cursor-pointer"
                  >
                    close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="bg-rose-100 rounded-t-2xl w-[98%] lg:w-3/5 px-2 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-center gap-2 bg-rose-300 shadow-md text-white rounded-lg py-1 px-4 mt-2 mb-1">
          <div className="w-[5%]">#</div>
          <div className="w-[25%] text-center">Model Name</div>
          <div className="w-[25%] text-center">Company Name</div>
          <div className="w-[25%] text-center">Product Type</div>
          <div className="w-[20%]"></div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide text-center font-semibold text-white">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-center gap-2 bg-slate-50 shadow-md text-rose-700 rounded-lg p-1 my-1"
            >
              <div className="w-[5%] text-rose-600">{index + 1 + "."}</div>
              <div className="w-[25%]">{product.model_name}</div>
              <div className="w-[25%]">{product.companyName}</div>
              <div className="w-[20%]">{product.product_type}</div>
              <div className="w-[25%] flex justify-center items-center gap-2">
                <button
                  className="bg-rose-500 text-white rounded-lg p-1 cursor-pointer"
                  onClick={() => {
                    setIsOpenModal(true);
                    setEditMode(true);
                    setValue("id", product.id);
                    setValue("company_id", product.companyId);
                    setValue("model_name", product.model_name);
                    setValue("product_type", product.product_type);
                  }}
                >
                  <FaPen/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddEditProducts;
