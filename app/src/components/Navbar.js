import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

export default function Navbar({ route }) {
  const navigate = useNavigate();
  return (
    <header className="w-full bg-gray-200 text-gray-900 text-white p-2 sm:px-6 lg:px-8">
      <div
        onClick={() => navigate(-1)}
        className="container mx-auto cursor-pointer flex items-center font-semibold text-gray-900 hover:text-gray-800 "
      >
        <IoIosArrowBack className="mx-2 text-rose-600" />
        <div>Dashboard</div>
        {route?.map((name, index) => {
          return (
            <div key={index} className="flex items-center">
              <div className="mx-1 text-sm text-rose-600">&gt;</div>
              <div>{name}</div>
            </div>
          );
        })}
      </div>
    </header>
  );
}
