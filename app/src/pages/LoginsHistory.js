import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useStateContext } from "../context/StateContext";
import { FaFilter } from "react-icons/fa6";
import { formatDateTimeToIST } from "../utils/date";

function LoginsHistory() {
  const { setMessages } = useStateContext();
  const [logins, setLogins] = useState([]);
  const [isActiveFilter, setIsActiveFilter] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [success, setSuccess] = useState(null);

  function clear() {
    setStart(null);
    setEnd(null);
    setSuccess(null);
  }

  const fetchLogins = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-logins",
      data: { start, end, success },
    });

    if (response.success) {
      setLogins(response.data);
    } else {
      setMessages((msgs) => [
        { id: Date.now(), text: response.message, success: false },
        ...msgs,
      ]);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, []);

  return (
    <div className="w-full flex flex-col items-center h-screen">
      <Navbar route={["Logins"]} />
      {/* <div className="flex flex-col md:flex-row jusitfy-center items-center gap-3 mb-1">
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
                {id ? "Update" : "Add Customer"}
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
      </div> */}

      <div className="relative w-full my-1 w-full md:w-4/5 flex items-center gap-1">
        <div className="flex-1 text-center font-semibold text-white bg-gray-800 rounded-xl py-1 px-2 flex items-center">
          <div className="w-[5%]">Sr.</div>
          <div className="w-[25%] text-start">Username</div>
          <div className="w-[15%] text-center">Date</div>
          <div className="w-[55%] text-center">Message</div>
        </div>
        <div
          onClick={() => {
            setIsActiveFilter(!isActiveFilter);
            clear();
          }}
          className="p-2 bg-gray-800 rounded-xl text-white cursor-pointer"
        >
          <FaFilter className="size-4" />
        </div>
        {isActiveFilter && (
          <div className="absolute right-0 top-8 m-1 p-2 bg-gray-800 font-semibold text-white rounded-lg space-y-1">
            <div className="text-center">Filter</div>
            <div className="text-sm">
              <label htmlFor="start" className="w-10 inline-block">
                Start:{" "}
              </label>{" "}
              <input
                type="datetime-local"
                value={start||""}
                onChange={(e) => setStart(e.target.value)}
                name="start"
                id="start"
                className="px-2 py-1 bg-slate-200 text-black rounded-lg"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="end" className="w-10 inline-block">
                End:{" "}
              </label>{" "}
              <input
                type="datetime-local"
                value={end||""}
                onChange={(e) => setEnd(e.target.value)}
                name="end"
                id="end"
                className="px-2 py-1 bg-slate-200 text-black rounded-lg"
              />
            </div>
            <div className="flex gap-2 my-1 justify-center items-center">
              <div
                onClick={() => setSuccess((suc) => (suc ? null : 1))}
                className={
                  "rounded-full cursor-pointer px-2 py-1 border border-green-600 text-sm " +
                  (success ? "bg-green-600 text-white" : "text-green-500")
                }
              >
                Successful
              </div>
              <div
                onClick={() =>
                  setSuccess((suc) => (suc === 0 ? null : 0))
                }
                className={
                  "rounded-full cursor-pointer px-2 py-1 border border-red-500 text-sm " +
                  (success === 0 ? "bg-red-500 text-white" : "text-red-500")
                }
              >
                Failed
              </div>
            </div>
            <button onClick={fetchLogins} type="button" className="bg-gray-100 text-gray-800 rounded-lg py-1 px-2 cursor-pointer">Get</button>
          </div>
        )}
      </div>
      <ul className="flex-1 w-full md:w-4/5 bg-gray-200 rounded-xl p-2 space-y-1 overflow-y-auto scrollbar-hide">
        {logins.map((login, index) => (
          <li
            key={login.id}
            className={
              "flex items-center font-semibold text-white rounded-lg py-1 px-2 text-sm " +
              (login.success ? "bg-green-600" : "bg-red-600")
            }
          >
            <div className="w-[5%]">{index + 1 + "."}</div>
            <div className="w-[25%]">{login.username}</div>
            <div className={"w-[20%] uppercase"}>
              {formatDateTimeToIST(login.time)}
            </div>
            <div
              className="w-[50%] text-center line-clamp-1"
              title={login.message}
            >
              {login.message}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LoginsHistory;
