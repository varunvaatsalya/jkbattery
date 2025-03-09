import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useStateContext } from "../context/StateContext";
// [#d27c61]  - color

const ports = {
  admin: {
    links: "/adminDashboard",
  },
  user: {
    links: "/userDashboard",
  },
};

function Login() {
  const { register, handleSubmit, reset } = useForm();
  const { user, setUser } = useAuth();
  const { setMessages } = useStateContext();

  // useEffect(() => {}, [user]);

  async function onSubmit(data) {
    const result = await window.auth.login(data.username, data.password);
    if (result.success) {
      setUser(result.data);
    } else {
      setMessages((msgs) => [
        { id: Date.now(), text: result.error, success:false },
        ...msgs,
      ]);
    }
    reset();
  }

  const handleLogout = () => {
    window.auth.logout();
    setUser(null);
  };

  return (
    <div className="h-screen px-4 text-gray-950 flex flex-col items-center font-semibold font-[Roboto]">
      <div className="my-6 text-center">
        <div className="text-4xl md:text-5xl font-bold my-2">
          Welcome to, <span className="text-rose-500">JK Battery</span>
        </div>
        <div className="font-semibold">
          Shop No. 5, Zila Panchayat Market. Infront Of G.I.C.
        </div>
        <div className="font-semibold">
          Bela Pratapgarh, Uttar Pradesh, 230001
        </div>
        {/* {user && <div>{user.username}</div>} */}
      </div>
      {/* <Link to={"/adminDashboard"}>admin</Link>
      <Link to={"/userDashboard"}>user</Link> */}
      {user ? (
        <div className="flex-1 flex flex-col items-center justify-around">
          <h2 className="text-2xl">
            Welcome Back, <span className="text-rose-500">{user.username}</span>
          </h2>
          <div className="flex flex-col justify-center items-center gap-3">
            <Link
              to={ports[user.role].links}
              className="py-4 px-8 rounded-lg bg-rose-500 hover:bg-rose-700 font-semibold text-white text-xl"
            >
              DashBoard
            </Link>
            <button
              className="cursor-pointer border border-rose-600 hover:bg-rose-500 text-rose-500 hover:text-white duration-300 px-4 py-2 rounded-xl"
              onClick={handleLogout}
            >
              <RiLogoutCircleLine className="size-6" />
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm mx-auto"
        >
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 ">
            Login
          </h1>
          <div className="mb-6">
            <input
              type="text"
              autoFocus
              placeholder="Username"
              {...register("username", { required: "Username is required" })}
              className="w-full font-semibold p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:text-rose-600 transition duration-300 focus:scale-[1.02] focus:shadow-lg focus:scale-[1.02] "
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="w-full font-semibold p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:text-rose-600 transition duration-300 focus:scale-[1.02] focus:shadow-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer bg-rose-500 text-white p-4 rounded-lg hover:bg-rose-700 transition duration-300 shadow-lg font-semibold text-lg hover:scale-105"
          >
            Login
          </button>
        </form>
      )}
    </div>
  );
}

export default Login;
