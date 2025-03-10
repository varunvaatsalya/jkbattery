import React from "react";
import Navbar from "../components/Navbar";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import { BsBuildingFillAdd } from "react-icons/bs";
import { Link } from "react-router-dom";

function Products() {
  const Works = [
    {
      name: "Add/Edit Products",
      description: "You can view, create & modify all the products here",
      icon: <HiOutlineViewGridAdd size={50} />,
      link: `/products/addEditProducts`,
      color: "bg-green-700",
    },
    {
      name: "Company",
      description:
        "You can view & create all the companies and there products here",
      icon: <BsBuildingFillAdd size={50} />,
      link: `/products/company`,
      color: "bg-red-700",
    },
  ];
  return (
    <div className="flex flex-col max-h-screen h-screen">
      <Navbar route={["Product"]} />
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
      </div>
    </div>
  );
}

export default Products;
