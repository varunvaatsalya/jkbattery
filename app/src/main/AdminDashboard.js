import React from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { IoLogOut, IoNewspaper } from "react-icons/io5";
import { FaCarBattery, FaPeopleLine, FaUsersGear } from "react-icons/fa6";
import { GrUserWorker } from "react-icons/gr";
import { SiSimplelogin } from "react-icons/si";
import { BsPersonFillUp } from "react-icons/bs";

function AdminDashboard() {
  const navigate = useNavigate();

  const Works = [
    {
      name: "Complaint",
      description: "You can view & create customer complaints here",
      icon: <IoNewspaper size={50} />,
      link: "/complaints",
      color: "bg-emerald-700",
    },
    {
      name: "Customers",
      description:
        "You can view, create & modify all the customers and there previous order here",
      icon: <FaPeopleLine size={50} />,
      link: "/customers",
      color: "bg-rose-500",
    },
    {
      name: "Products",
      description:
        "You can view, create & modify all the product and there meta data here",
      icon: <FaCarBattery size={50} />,
      link: "/products",
      color: "bg-blue-700",
    },{
      name: "Dealers",
      description:
        "You can view, create & modify all the dealers and there previous order here",
      icon: <BsPersonFillUp size={50} />,
      link: "/adminDashboard/dealers",
      color: "bg-orange-900",
    },
    {
      name: "Employees",
      description: "You can view & create all the employees here",
      icon: <GrUserWorker size={50} />,
      link: "/adminDashboard/employees",
      color: "bg-violet-700",
    },
    {
      name: "Users",
      description: "You can view & create all the users here",
      icon: <FaUsersGear size={50} />,
      link: "/adminDashboard/users",
      color: "bg-yellow-700",
    },
    {
      name: "Logins",
      description: "You can view all the login details here",
      icon: <SiSimplelogin size={50} />,
      link: "/adminDashboard/logins",
      color: "bg-teal-700",
    },
  ];

  return (
    <div className="flex flex-col max-h-screen h-screen">
      <Navbar />
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-wrap justify-center items-center gap-8 p-6">
        {Works.map((workCard) => {
          return (
            <Link
              to={workCard.link}
              key={workCard.name}
              className={`${workCard.color} w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center space-y-1 hover:scale-105`}
            >
              {workCard.icon}
              <div className="font-bold text-xl">{workCard.name}</div>
              <div className="text-center">{workCard.description}</div>
            </Link>
          );
        })}
        <button
          onClick={() => {
            // document.cookie =
            //   "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // router.push("/login");
            navigate("/");
          }}
          className="w-full p-3 h-60 md:w-2/5 lg:w-1/5 bg-red-700 hover:bg-red-800 cursor-pointer text-white rounded-xl flex flex-col justify-center items-center space-y-1"
        >
          <IoLogOut size={60} />
          <div className="font-bold text-xl">Logout</div>
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
