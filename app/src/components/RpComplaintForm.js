import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
} from "react-icons/fa";
import {
  TbCircleNumber1Filled,
  TbCircleNumber2Filled,
  TbCircleNumber3Filled,
} from "react-icons/tb";
import { useAuth } from "../context/AuthContext";

function RpComplaintForm({ fetchComplaints,isOpenReplacedModal, setIsOpenReplacedModal }) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const { register, handleSubmit, watch, setValue, reset } = useForm();

  const statusDetails = watch("status");
  const isStep1Completed = statusDetails ? true : false;

  const productDetails = watch("productDetails");
  const remark = watch("remark");
  const isStep2Completed = !!(
    (productDetails?.replaced_product_id &&
      productDetails?.replaced_serial_no &&
      productDetails?.replaced_at) ||
    remark
  );

  const replacedByDetails = watch("replaced_by");
  const isStep3Completed = !!replacedByDetails;

  useEffect(() => {
    setValue("productDetails", "");
    setValue("remark", "");
    setValue("replaced_by", "");
  }, [statusDetails]);

  const stepsData = [
    {
      id: 1,
      icon: TbCircleNumber1Filled,
      name: "Change Status",
      component: StatusDetails,
      props: { register, reset },
      isCompleted: isStep1Completed,
    },
    {
      id: 2,
      icon: TbCircleNumber2Filled,
      name:
        statusDetails === "Rejected" ? "Remark" : "Replaced Product Details",
      component:
        statusDetails === "Rejected" ? RemarkDetails : ReplacedProductDetails,
      props: { register, setValue, products },
      isCompleted: isStep2Completed,
    },
  ];

  if (statusDetails && statusDetails === "Replaced") {
    stepsData.push({
      id: 3,
      icon: TbCircleNumber3Filled,
      name: "Replaced By Details",
      component: ReplacedByDetails,
      props: {
        register,
        employees,
      },
      isCompleted: isStep3Completed,
    });
  }

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
  const fetchEmployees = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-employees",
    });

    if (response.success) {
      setEmployees(response.data);
    } else {
      setMessage(`${response.error}`);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchEmployees();
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
    data.complaint_id = isOpenReplacedModal.complaint_id;
    data.modified_by = user.id;
    console.log(data);

    const response = await window.electron.invoke("database-operation", {
      action: "update-complaint",
      data,
    });

    if (response.success) {
      setMessage(`Complaint Saved`);
      fetchComplaints();
      setIsOpenReplacedModal(null);
    } else {
      setMessage(`Error: ${response.message}`);
    }
    setTimeout(
      () => {
        reset();
        setMessage("");
      },
      response.success ? 1500 : 4500
    );
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
            Replace Product Form
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
              onClick={() => setIsOpenReplacedModal(null)}
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

export default RpComplaintForm;

function StatusDetails({ register }) {
  return (
    <div className="flex items-center gap-1">
      <label htmlFor="status">Status:</label>
      <select
        name="status"
        id="status"
        {...register("status", {
          required: true,
        })}
        className="px-2 py-1 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500 "
      >
        <option value="">-- Change Status --</option>
        <option value="Replaced">Replaced</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>
  );
}

function RemarkDetails({ register }) {
  return (
    <textarea
      name="remark"
      id="remark"
      rows="5"
      {...register("remark")}
      placeholder="Enter the reason of Rejecting"
      className="p-2 w-1/2 min-h-16 max-h-60 scrollbar-hide bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
    ></textarea>
  );
}

function ReplacedProductDetails({ products, register }) {
  return (
    <>
      <select
        {...register("productDetails.replaced_product_id", {
          required: true,
        })}
        className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
      >
        <option value="">Select Product</option>
        {products.length > 0
          ? products.map((product) => (
              <option key={product.model_name} value={product.id}>
                {product.companyName + " | " + product.model_name}
              </option>
            ))
          : ""}
      </select>
      <input
        type="text"
        {...register("productDetails.replaced_serial_no", {
          required: true,
        })}
        className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
        placeholder="Enter Serial No"
      />
      <div className="w-1/2 flex flex-col">
        <label
          htmlFor="replacedDate"
          className="text-start px-2 text-rose-600 font-semibold"
        >
          *Replaced Date
        </label>
        <input
          type="date"
          id="replacedDate"
          {...register("productDetails.replaced_at", {
            required: true,
          })}
          className="p-2 w-full bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
        />
      </div>
    </>
  );
}

function ReplacedByDetails({ register, employees }) {
  return (
    <>
      {" "}
      <select
        {...register("replaced_by", {
          required: true,
        })}
        className="p-2 w-1/2 bg-slate-300 rounded-lg focus:outline-none font-semibold focus:ring-2 focus:ring-gray-500"
      >
        <option value="">Select Employee</option>
        {employees.length > 0
          ? employees.map((employee) => (
              <option key={employee.eid} value={employee.id}>
                {employee.name}
              </option>
            ))
          : ""}
      </select>
    </>
  );
}
