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
  TbCircleNumber5Filled,
  TbCircleNumber6Filled,
} from "react-icons/tb";

function NewComplaintForm({ setIsOpenModal, fetchComplaints }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [image, setImage] = useState(null);


  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      productDetails: {},
      documentDetails: {},
      customerDetails: {},
      dealerDetails: {},
      status: "Pending",
      replacementDetails: {},
    },
  });
  const productDetails = watch("productDetails");
  const isStep1Completed = !!(
    productDetails?.complaint_id &&
    productDetails?.serial_no &&
    productDetails?.purchaseDate
  );
  const documentDetails = watch("documentDetails");
  const isStep2Completed = !!(
    documentDetails?.documentName && documentDetails?.image
  );
  const customerDetails = watch("customerDetails");
  const isStep3Completed = !!customerDetails?.customer_id;

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
      component: DocumentsDetails,
      props: { register, setValue,image, setImage },
      isCompleted: isStep2Completed,
    },
    {
      id: 3,
      icon: TbCircleNumber3Filled,
      component: CustomersDetails,
      props: { customers, register },
      isCompleted: isStep3Completed,
    },
    {
      id: 4,
      icon: TbCircleNumber4Filled,
      component: () => <></>,
      isCompleted: false,
    },
    {
      id: 5,
      icon: TbCircleNumber5Filled,
      component: () => <></>,
      isCompleted: false,
    },
    {
      id: 6,
      icon: TbCircleNumber6Filled,
      component: () => <></>,
      isCompleted: false,
    },
  ];

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
  const fetchCustomers = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-customers",
    });

    if (response.success) {
      setCustomers(response.data);
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

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
  async function onSubmit(data) {}

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
            <button
              onClick={() => setIsOpenModal(false)}
              className="py-1 px-3 rounded-lg border border-rose-500 text-rose-500 hover:text-rose-700"
            >
              Cancel
            </button>
            <div className="flex justify-between items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="text-pink-500 hover:text-pink-700 cursor-pointer"
                >
                  <FaRegArrowAltCircleLeft className="size-8" />
                </button>
              )}
              {currentStep < stepsData.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-pink-500 hover:text-pink-700 cursor-pointer"
                >
                  <FaRegArrowAltCircleRight className="size-8" />
                </button>
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
        {...register("productDetails.complaint_id", {
          required: true,
        })}
        className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
      >
        <option value="">Select Product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
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
          placeholder="Enter Serial No"
        />
      </div>
    </>
  );
}

function DocumentsDetails({ register, setValue,image, setImage }) {

  // 📌 Handle File Selection (Click)
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Create preview URL
      setValue("documentDetails.image", file);
    }
  };

  // 📌 Handle Drag & Drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Create preview URL
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
            {...register("documentDetails.documentName")}
            className="size-5"
          />
          <label htmlFor="warrantyCard">Warranty Card Available</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="billAvailable"
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

function CustomersDetails({ customers, register }) {
  return (
    <>
      <select
        {...register("customerDetails.customer_id", {
          required: true,
        })}
        className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
      >
        <option value="">Select Customer</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name + " | " + customer.contact}
          </option>
        ))}
      </select>
    </>
  );
}
