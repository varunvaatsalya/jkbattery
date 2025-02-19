import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { IoCloseCircle, IoPersonAdd } from "react-icons/io5";
import { FaPen } from "react-icons/fa6";

function Users() {
  const [id, setId] = useState("");
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);

  function reset() {
    setMessage("");
    setUserName("");
    setPassword("");
    setId("");
    setRole("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await window.electron.invoke("database-operation", {
      action: "save-user",
      data: { username, password, role },
    });

    if (response.success) {
      setMessage(`User saved with ID: ${response.id}`);
      fetchUsers();
    } else {
      setMessage(`Error: ${response.error}`);
    }
    setTimeout(() => {
      reset();
    }, 2500);
  };

  const fetchUsers = async () => {
    const response = await window.electron.invoke("database-operation", {
      action: "get-users",
    });

    if (response.success) {
      setUsers(response.data);
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full flex flex-col items-center h-screen">
      <Navbar route={["Users"]} />
      <div className="my-1 p-1 w-4/5 md:w-3/4 lg:w-1/2 rounded-xl bg-gray-300 text-gray-900 font-semibold text-center">
        List of all Users/Admins
      </div>
      <div className="flex flex-col md:flex-row jusitfy-center items-center gap-3 mb-1">
        {isOpenForm && (
          <form onSubmit={handleSubmit} className="bg-gray-200 rounded-lg p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Name"
                required
                className="bg-gray-50 p-1 rounded-lg font-semibold"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required={!id}
                className="bg-gray-50 p-1 rounded-lg font-semibold"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <select
                name="role"
                required
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                }}
                className="bg-gray-50 p-1 rounded-lg font-semibold"
              >
                <option value="">-- Select Role --</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="bg-gray-800 cursor-pointer px-2 rounded-lg text-white"
              >
                {id?"Update":"Add User"}
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
        <div className="w-[6%]">Sr.</div>
        <div className="w-[47%] text-start">Username</div>
        <div className="w-[47%] text-start">Role</div>
      </div>
      <ul className="flex-1 w-full md:w-4/5 lg:w-3/5 bg-gray-200 rounded-xl p-2 space-y-1 overflow-y-auto scrollbar-hide">
        {users.map((user, index) => (
          <li
            key={user.id}
            className="flex items-center font-semibold bg-gray-300 rounded-lg py-1 px-2 text-sm"
          >
            <div className="w-[5%]">{index + 1 + "."}</div>
            <div className="w-[45%]">{user.username}</div>
            <div className="w-[45%]">{user.role}</div>
            <div className="w-[5%] px-2 hover:text-gray-700 cursor-pointer" onClick={()=>{
              setId(user.id);
              setUserName(user.username);
              setRole(user.role);
            }}>
              <FaPen />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
