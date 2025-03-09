import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { IoCloseCircle, IoPersonAdd } from "react-icons/io5";
import { FaPen } from "react-icons/fa6";

function Dealers() {
  const [id, setId] = useState("");
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [dealers, setDealers] = useState([]);

  function reset() {
    setMessage("");
    setName("");
    setContact("");
    setAddress("");
    setId("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = { name, contact, address };
    if (id) data.id = id;
    const response = await window.electron.invoke("database-operation", {
      action: id ? "update-dealer" : "save-dealer",
      data,
    });

    if (response.success) {
      setMessage(`User Saved`);
      fetchDealers();
    } else {
      setMessage(`Error: ${response.message}`);
    }
    setTimeout(() => {
      reset();
    }, 2500);
  };

  const fetchDealers = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-dealers",
    });

    if (response.success) {
      setDealers(response.data);
    } else {
      setMessage(`${response.error}`);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  return (
    <div className="w-full flex flex-col items-center h-screen">
      <Navbar route={["Dealers"]} />
      <div className="my-1 p-1 w-4/5 md:w-3/4 lg:w-1/2 rounded-xl bg-gray-300 text-gray-900 font-semibold text-center">
        List of all Dealers
      </div>
      <div className="flex flex-col md:flex-row jusitfy-center items-center gap-3 mb-1">
        {isOpenForm && (
          <form onSubmit={handleSubmit} className="bg-gray-200 rounded-lg p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="bg-gray-50 p-1 rounded-lg font-semibold"
              />
              <input
                type="number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Contact"
                required={!id}
                className="bg-gray-50 p-1 rounded-lg font-semibold"
              />
            </div>
            <div className="flex justify-center gap-2 mt-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="bg-gray-50 p-1 rounded-lg font-semibold"
              />
              <button
                type="submit"
                className="bg-gray-800 cursor-pointer px-2 py-1 rounded-lg text-white"
              >
                {id ? "Update" : "Add Dealer"}
              </button>
            </div>
          </form>
        )}
        <button
          onClick={() => {
            setIsOpenForm(!isOpenForm);
            reset();
          }}
          className="px-4 py-2 rounded-full font-semibold bg-gray-800 text-white cursor-pointer flex items-center gap-2"
        >
          {isOpenForm ? (
            <>
              <IoCloseCircle />
              <div>Close</div>
            </>
          ) : (
            <>
              <IoPersonAdd />
              <div>Add</div>
            </>
          )}
        </button>
      </div>

      {message && (
        <p className="text-red-600 bg-red-100 py-1 px-2 rounded-lg my-1">
          {message}
        </p>
      )}

      <div className="mb-1 w-full md:w-4/5 lg:w-3/5 text-center font-semibold text-white bg-gray-800 rounded-xl py-1 px-2 flex items-center">
        <div className="w-[5%]">Sr.</div>
        <div className="w-[15%] text-start">#DID</div>
        <div className="w-[25%] text-start">Name</div>
        <div className="w-[15%] text-start">Contact</div>
        <div className="w-[35%] text-start">Address</div>
      </div>
      <ul className="flex-1 w-full md:w-4/5 lg:w-3/5 bg-gray-200 rounded-xl p-2 space-y-1 overflow-y-auto scrollbar-hide">
        {dealers.map((dealer, index) => (
          <li
            key={dealer.id}
            className="flex items-center font-semibold bg-gray-300 rounded-lg py-1 px-2 text-sm"
          >
            <div className="w-[5%] text-rose-600">{index + 1 + "."}</div>
            <div className="w-[15%]">{dealer.did}</div>
            <div className="w-[25%]">{dealer.name}</div>
            <div className={"w-[15%] text-rose-600"}>{dealer.contact}</div>
            <div className="w-[35%] line-clamp-1" title={dealer.address}>{dealer.address}</div>
            {dealer.id !== 0 && (
              <div
                className="w-[5%] px-2 text-rose-600 hover:text-rose-800 cursor-pointer"
                onClick={() => {
                  setId(dealer.id);
                  setName(dealer.name);
                  setContact(dealer.contact);
                  setAddress(dealer.address);
                  setIsOpenForm(true);
                }}
              >
                <FaPen />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dealers;
