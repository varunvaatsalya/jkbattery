import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import Navbar from "../components/Navbar";

function Company() {
  const [updateMode, setUpdateMode] = useState(false);
  const [comapny, setCompanies] = useState([]);
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchCompanies = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-companies-with-products",
    });

    if (response.success) {
      setCompanies(response.data);
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCompanySubmit = async (data) => {
    if (id) data.id = id;
    const response = await window.electron.invoke("database-operation", {
      action: id && updateMode ? "update-company" : "save-company",
      data,
    });

    if (response.success) {
      setMessage(`Company Saved`);
      fetchCompanies();
    } else {
      setMessage(`Error: ${response.message}`);
    }
    setTimeout(
      () => {
        reset();
        setMessage("");
        setId("");
        setUpdateMode(false);
      },
      response.success ? 1500 : 4500
    );
  };

  return (
    <div className="flex flex-col items-center max-h-screen h-screen">
      <Navbar route={["Product", "Company"]} />
      <div className="my-2 w-full max-w-xl border border-gray-800 rounded-xl">
        <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg text-white">
          Manufacturers
        </div>
        {updateMode && (
          <div className="max-w-fit rounded px-3 py-1 text-xs font-semibold flex justify-center items-center gap-1 bg-red-400 text-white mx-auto mt-2">
            <div className="">Update Mode</div>
            <RxCross2
              className="size-5 hover:bg-red-600 rounded-full cursor-pointer"
              onClick={() => {
                reset();
                setId("");
                setUpdateMode(false);
              }}
            />
          </div>
        )}
        <form
          onSubmit={handleSubmit(handleCompanySubmit)}
          className="p-2 flex flex-col justify-center items-center gap-2"
        >
          <input
            type="text"
            {...register("name", {
              required: true,
            })}
            placeholder="Enter Company Name"
            className="outline-none w-4/5 text-black p-1 bg-gray-200 rounded-lg mx-auto"
          />
          <button
            type="submit"
            className="py-1 px-3 rounded-lg bg-rose-500 active:bg-rose-700 cursor-pointer font-semibold text-white"
          >
            {updateMode ? "Update" : "Add"}
          </button>
        </form>
        <div className="text-center text-red-500">{message}</div>
        <div className="overflow-y-auto scrollbar-hide max-h-[80vh] md:max-h-[70vh] lg:max-h-[60vh]">
          {comapny.map((cp) => (
            <div key={cp.id}>
              <hr className="border-t border-gray-600 w-3/4 mx-auto" />
              <div className="text-center text-black flex justify-center gap-2 items-center">
                <div className="">{cp.name}</div>
                <button
                  className="text-gray-600 hover:bg-gray-400 bg-gray-300 rounded text-xs font-semibold px-2"
                  onClick={() => {
                    setId(cp.id);
                    setValue("name", cp.name);
                    setUpdateMode(true);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Company;
