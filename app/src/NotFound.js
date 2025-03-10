import React from "react";
import { FaRegFaceSadTear } from "react-icons/fa6";
import { TbError404 } from "react-icons/tb";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center text-gray-800 bg-white items-center gap-1">
        <div className="text-2xl font-bold my-3">
            JK Battery - Pratapgarh
        </div>
      <FaRegFaceSadTear className="size-24 " />
      <TbError404 className="size-20 " />
      <div className="font-semibold w-1/4 text-wrap text-center text-lg">The page you are trying to access is not available.</div>
      <div className="font-semibold">Go to</div>
      <Link to={"/"} className="px-4 py-2 bg-gray-800 font-semibold text-white rounded-lg">Home Page</Link>
    </div>
  );
}

export default NotFound;
