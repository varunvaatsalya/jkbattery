import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleLeft,
} from "react-icons/fa";
import {
  TbCircleNumber1Filled,
  TbCircleNumber2Filled,
  TbCircleNumber3Filled,
  TbCircleNumber4Filled,
} from "react-icons/tb";
import { LuSearch } from "react-icons/lu";
import {
  IoIosArrowDropdown,
  IoIosArrowDropright,
  IoMdRemoveCircle,
} from "react-icons/io";
import { useAuth } from "../context/AuthContext";

function NewComplaintForm({ setIsOpenModal, fetchComplaints }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [image, setImage] = useState(null);
  const [noDealer, setNoDealer] = useState(false);

  const [section, setSection] = useState("search");

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      productDetails: {},
      documentDetails: {},
      customerDetails: {},
      dealerDetails: {},
    },
  });
  const productDetails = watch("productDetails");
  const isStep1Completed = !!(
    productDetails?.product_id &&
    productDetails?.serial_no &&
    productDetails?.purchaseDate
  );

  const documentDetails = watch("documentDetails");
  const isStep2Completed = !!(
    documentDetails?.documentName && documentDetails?.image
  );

  const customerDetails = watch("customerDetails");
  const isStep3Completed = !!(
    customerDetails?.customer_id ||
    (customerDetails?.customer_name &&
      customerDetails?.customer_contact &&
      customerDetails?.customer_address)
  );

  const dealerDetails = watch("dealerDetails");
  const isStep4Completed = !!(noDealer || dealerDetails?.dealer_id);

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
  const findCustomer = async (query) => {
    const response = await window.electron.invoke("database-operation", {
      action: "find-customers",
      data: { query },
    });

    if (response.success) {
      setCustomers(response.data);
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };
  const findDealer = async (query) => {
    const response = await window.electron.invoke("database-operation", {
      action: "find-dealers",
      data: { query },
    });

    if (response.success) {
      setDealers(response.data);
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const stepsData = [
    {
      id: 1,
      icon: TbCircleNumber1Filled,
      name: "Purchase Product Details",
      component: PurchaseProductDetails,
      props: { products, register },
      isCompleted: isStep1Completed,
    },
    {
      id: 2,
      icon: TbCircleNumber2Filled,
      name: "Document Details",
      component: DocumentsDetails,
      props: { register, setValue, image, setImage },
      isCompleted: isStep2Completed,
    },
    {
      id: 3,
      icon: TbCircleNumber3Filled,
      name: "Customer Details",
      component: CustomersDetails,
      props: {
        customers,
        setCustomers,
        selectedCustomer,
        setSelectedCustomer,
        section,
        setSection,
        setValue,
        register,
        findCustomer,
      },
      isCompleted: isStep3Completed,
    },
    {
      id: 4,
      icon: TbCircleNumber4Filled,
      name: "Dealer Details",
      component: DealerDetails,
      props: {
        findDealer,
        setValue,
        selectedDealer,
        setSelectedDealer,
        noDealer,
        setNoDealer,
        dealers,
        setDealers,
      },
      isCompleted: isStep4Completed,
    },
  ];

  const handleNext = () => {
    if (currentStep < stepsData.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  async function onSubmit(data) {
    const incompleteStep = stepsData.find((obj) => !obj.isCompleted);

    if (incompleteStep) {
      setCurrentStep(incompleteStep.id);
      setMessage("Please Complete the step");
      setTimeout(() => {
        setMessage("");
      }, 2500);
      return;
    }
    const file = data.documentDetails.image;
    const fileName = file.name;
    const extension = fileName.split(".").pop().toLowerCase();

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const buffer = new Uint8Array(reader.result);
      const response = await window.electron.fileInvoke(
        "database-file-operation",
        "save-complaint",
        {
          product_id: data.productDetails.product_id,
          serial_no: data.productDetails.serial_no,
          purchaseDate: data.productDetails.purchaseDate,
          documentName: data.documentDetails.documentName,
          customer_id: data.customerDetails.customer_id || "",
          customer_name: data.customerDetails.customer_name || "",
          customer_contact: data.customerDetails.customer_contact || "",
          customer_address: data.customerDetails.customer_address || "",
          dealer_id: data.dealerDetails.dealer_id || "",
          status: "Pending",
          created_by: user.id,
        },
        buffer,
        extension
      );
      if (response.success) {
        reset();
        fetchComplaints();
        setIsOpenModal(false);
      } else {
        setMessage(response.message);
      }
    };
  }

  const StepComponent = stepsData.find(
    (step) => step.id === currentStep
  )?.component;
  const StepProps = stepsData.find((step) => step.id === currentStep)?.props;
  const StepName = stepsData.find((step) => step.id === currentStep)?.name;

  return (
    <div className="absolute top-0 left-0">
      <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[95%] md:w-4/5 lg:w-3/4 max-h-[90vh] overflow-y-auto scrollbar-hide py-2 text-center bg-slate-200 px-4 rounded-xl flex flex-col justify-center items-center gap-2"
        >
          <h2 className="text-xl font-bold text-rose-500">
            New Complaint Form
          </h2>
          {message && <div className="text-red-500">{message}</div>}
          <div className="flex justify-center items-center gap-1">
            {stepsData.map((step, index) => {
              const Icon = step.icon;
              return (
                <Fragment key={step.id}>
                  <Icon
                    onClick={() => setCurrentStep(step.id)}
                    className={`size-5 cursor-pointer ${
                      step.isCompleted ? "text-green-700" : "text-gray-500"
                    } ${
                      currentStep === step.id
                        ? "ring-2 rounded-full ring-" +
                          (step.isCompleted ? "green-700" : "gray-500")
                        : ""
                    }`}
                  />
                  {index < stepsData.length - 1 && (
                    <hr
                      className={`w-12 ${
                        stepsData[index + 1].isCompleted
                          ? "border-green-700"
                          : "border-gray-500"
                      }`}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
          <div className="font-bold text-lg text-gray-800">
            {StepName || "Details"}
          </div>
          {StepComponent && <StepComponent {...StepProps} />}
          <hr className="w-full border-t border-rose-300 my-1" />
          <div className="w-full flex justify-between items-center font-semibold items-center">
            <div
              onClick={() => setIsOpenModal(false)}
              className="py-1 cursor-pointer px-3 rounded-lg border border-rose-500 text-rose-500 hover:text-rose-700"
            >
              Cancel
            </div>
            <div className="flex justify-between items-center gap-2">
              {currentStep > 1 && (
                <div
                  onClick={handlePrev}
                  className="text-pink-500 hover:text-pink-700 cursor-pointer"
                >
                  <FaRegArrowAltCircleLeft className="size-8" />
                </div>
              )}
              {currentStep < stepsData.length ? (
                <div
                  onClick={handleNext}
                  className="text-pink-500 hover:text-pink-700 cursor-pointer"
                >
                  <FaRegArrowAltCircleRight className="size-8" />
                </div>
              ) : (
                <button
                  type="submit"
                  className="bg-pink-500 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-pink-700"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewComplaintForm;

function PurchaseProductDetails({ products, register }) {
  return (
    <>
      <select
        {...register("productDetails.product_id", {
          required: true,
        })}
        className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
      >
        <option value="">Select Product</option>
        {products.map((product) => (
          <option key={product.model_name} value={product.id}>
            {product.companyName + " | " + product.model_name}
          </option>
        ))}
      </select>
      <input
        type="text"
        {...register("productDetails.serial_no", {
          required: true,
        })}
        className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
        placeholder="Enter Serial No"
      />
      <div className="w-1/2 flex flex-col">
        <label
          htmlFor="purchaseDate"
          className="text-start px-2 text-rose-600 font-semibold"
        >
          *Purchase Date
        </label>
        <input
          type="date"
          id="purchaseDate"
          {...register("productDetails.purchaseDate", {
            required: true,
          })}
          className="p-2 w-full bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
        />
      </div>
    </>
  );
}

function DocumentsDetails({ register, setValue, image, setImage }) {
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setValue("documentDetails.image", file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setValue("documentDetails.image", file);
    }
  };
  return (
    <>
      <div className="flex flex-wrap justify-center items-center gap-3 font-semibold">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="warrantyCard"
            value="Warranty Card"
            {...register("documentDetails.documentName")}
            className="size-5"
          />
          <label htmlFor="warrantyCard">Warranty Card Available</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="billAvailable"
            value="Purchase Bill"
            {...register("documentDetails.documentName")}
            className="size-5"
          />
          <label htmlFor="billAvailable">Bill Available</label>
        </div>
      </div>

      <div
        className="border-2 border-dashed rounded-xl border-gray-400 w-48 h-60 flex flex-col items-center justify-center p-4 bg-white cursor-pointer hover:border-rose-500 transition-all"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById("imageInput").click()}
      >
        {image ? (
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
        ) : (
          <p className="text-gray-500">Drag & Drop or Click to Upload</p>
        )}
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Reset Button */}
      {image && (
        <button
          className="mt-4 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          onClick={() => {
            setImage(null);
            setValue("documentDetails.image", null);
          }}
        >
          Remove Image
        </button>
      )}
    </>
  );
}

function CustomersDetails({
  customers,
  setCustomers,
  setValue,
  register,
  selectedCustomer,
  section,
  setSection,
  setSelectedCustomer,
  findCustomer,
}) {
  const [openCustomerList, setOpenCustomerList] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <>
      <div className="flex gap-2">
        <div
          onClick={() => {
            setSection("search");
            setSelectedCustomer(null);
            setValue("customerDetails", {});
          }}
          className={
            "cursor-pointer font-semibold px-2 py-1 rounded-lg " +
            (section === "search" ? "bg-rose-500 text-white" : "text-rose-500 ")
          }
        >
          Search the customer
        </div>
        <div
          onClick={() => {
            setSection("new");
            setSelectedCustomer(null);
            setValue("customerDetails", {});
          }}
          className={
            "cursor-pointer font-semibold px-2 py-1 rounded-lg " +
            (section === "new" ? "bg-rose-500 text-white" : "text-rose-500 ")
          }
        >
          Create new customer
        </div>
      </div>
      {section === "search" ? (
        selectedCustomer ? (
          <div className="flex justify-center text-rose-500 items-center font-semibold gap-2">
            {selectedCustomer.name + " | " + selectedCustomer.contact}
            <IoMdRemoveCircle
              onClick={() => {
                setValue("customerDetails", {});
                setSelectedCustomer(null);
              }}
              className="size-5 hover:text-rose-800"
            />
          </div>
        ) : (
          <div className="relative bottom-0 w-1/2">
            <div className="flex justify-center gap-2 items-center">
              <button
                type="button"
                onClick={() => setOpenCustomerList(!openCustomerList)}
                className="rounded-lg bg-slate-300 p-2"
              >
                {openCustomerList ? (
                  <IoIosArrowDropdown className="text-gray-900 size-5" />
                ) : (
                  <IoIosArrowDropright className="text-gray-900 size-5" />
                )}
              </button>
              <input
                type="text"
                placeholder="Search with name, contact or address"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="p-2 w-full bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    findCustomer(query);
                    setOpenCustomerList(true);
                  }}
                  className="rounded-lg bg-slate-300 p-2"
                >
                  <LuSearch className="text-gray-900 size-5" />
                </button>
              )}
            </div>
            {openCustomerList && (
              <div className="absolutee z-30 my-2 rounded-lg w-full p-1 bg-slate-300 max-h-48 overflow-y-auto scrollbar-hide space-y-1">
                {customers.length > 0 ? (
                  <>
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          setValue("customerDetails.customer_id", customer.id);
                          setOpenCustomerList(false);
                          setSelectedCustomer(customer);
                        }}
                        className="font-semibold hover:bg-slate-100 cursor-pointer rounded-lg"
                      >
                        {customer.name + " | " + customer.contact}
                      </div>
                    ))}
                    <div
                      onClick={() => setCustomers([])}
                      className="hover:underline underline-gray-900 text-gray-900 text-sm cursor-pointer"
                    >
                      Clear all
                    </div>
                  </>
                ) : (
                  <div className="font-semibold text-gray-900">
                    No Customers
                  </div>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              {...register("customerDetails.customer_name", {
                required: true,
              })}
              placeholder="Name"
              required
              className="bg-gray-50 p-1 rounded-lg font-semibold"
            />
            <input
              type="number"
              {...register("customerDetails.customer_contact", {
                required: true,
              })}
              placeholder="Contact"
              required
              className="bg-gray-50 p-1 rounded-lg font-semibold"
            />
          </div>
          <div className="flex justify-center gap-2 mt-2">
            <input
              type="text"
              {...register("customerDetails.customer_address", {
                required: true,
              })}
              placeholder="Address"
              className="bg-gray-50 p-1 rounded-lg font-semibold"
            />
          </div>
        </>
      )}
    </>
  );
}

function DealerDetails({
  findDealer,
  setValue,
  selectedDealer,
  setSelectedDealer,
  dealers,
  setDealers,
  noDealer,
  setNoDealer,
}) {
  const [openDealerList, setOpenDealerList] = useState(false);
  const [queryDealer, setQueryDealer] = useState("");
  useEffect(() => {
    setOpenDealerList(true);
  }, [dealers]);
  return (
    <>
      <div className="flex jusity-center items-center gap-2">
        <input
          type="checkbox"
          checked={noDealer}
          onChange={(e) => {
            setNoDealer(e.target.checked);
            setValue("dealerDetails.dealer_id", "");
            setOpenDealerList(false);
            setSelectedDealer(null);
          }}
          className="size-5"
          id="noDealer"
        />
        <label htmlFor="noDealer" className="font-semibold ">
          No Dealer
        </label>
      </div>
      <div className="w-full flex items-center justify-center gap-2 text-rose-300 font-semibold">
        <hr className="border-t border-rose-300 w-2/5" />
        <div>or</div>
        <hr className="border-t border-rose-300 w-2/5" />
      </div>
      {selectedDealer ? (
        <div className="flex justify-center text-rose-500 items-center font-semibold gap-2">
          {selectedDealer.name + " | " + selectedDealer.contact}
          <IoMdRemoveCircle
            onClick={() => {
              setValue("dealerDetails.dealer_id", "");
              setSelectedDealer(null);
            }}
            className="size-5 hover:text-rose-800"
          />
        </div>
      ) : (
        <div className="relative bottom-0 w-1/2">
          <div className="flex justify-center gap-2 items-center">
            <button
              type="button"
              onClick={() => setOpenDealerList(!openDealerList)}
              className="rounded-lg bg-slate-300 p-2"
            >
              {openDealerList ? (
                <IoIosArrowDropdown className="text-gray-900 size-5" />
              ) : (
                <IoIosArrowDropright className="text-gray-900 size-5" />
              )}
            </button>
            <input
              type="text"
              placeholder="Search with name, contact or address"
              value={queryDealer}
              onChange={(e) => setQueryDealer(e.target.value)}
              className="p-2 w-full bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="button"
              onClick={() => findDealer(queryDealer)}
              className="rounded-lg bg-slate-300 p-2"
            >
              <LuSearch className="text-gray-900 size-5" />
            </button>
          </div>
          {openDealerList && (
            <div className="absolutee z-30 my-2 rounded-lg w-full p-1 bg-slate-300 max-h-48 overflow-y-auto scrollbar-hide space-y-1">
              {dealers.length > 0 ? (
                <>
                  {dealers.map((dealer) => (
                    <div
                      key={dealer.id}
                      onClick={() => {
                        setValue("dealerDetails.dealer_id", dealer.id);
                        setNoDealer(false);
                        setOpenDealerList(false);
                        setSelectedDealer(dealer);
                      }}
                      className="font-semibold hover:bg-slate-100 cursor-pointer rounded-lg"
                    >
                      {dealer.name + " | " + dealer.contact}
                    </div>
                  ))}
                  <div
                    onClick={() => setDealers([])}
                    className="hover:underline underline-gray-900 text-gray-900 text-sm cursor-pointer"
                  >
                    Clear all
                  </div>
                </>
              ) : (
                <div className="font-semibold text-gray-900">No Dealers</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
