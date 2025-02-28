import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { BiSolidAddToQueue } from "react-icons/bi";
import NewComplaintForm from "../components/NewComplaintForm";

function Complaints() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  async function fetchComplaints() {}
  return (
    <div className="flex flex-col items-center max-h-screen h-screen">
      <Navbar route={["Complaints"]} />
      <div className="w-full my-1 px-2 md:px-4 lg:px-8 flex justify-between items-center">
        <div className="font-bold text-2xl text-pink-600">Complaints</div>
        <button
          onClick={() => setIsOpenModal(true)}
          className="px-4 py-1 rounded-full font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-2"
        >
          <BiSolidAddToQueue />
          <div>Add</div>
        </button>
        {isOpenModal && (
          <NewComplaintForm
            setIsOpenModal={setIsOpenModal}
            fetchComplaints={fetchComplaints}
          />
        )}
      </div>
    </div>
  );
}

export default Complaints;
