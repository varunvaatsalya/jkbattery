import React from "react";
import { IoMdClose } from "react-icons/io";

function ImageView({ url, setOpenImage }) {
  return (
    <div className="absolute top-0 left-0">
      <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
        <div className="relative w-1/2 max-h-[90vh] overflow-y-auto scrollbar-hide py-2 bg-slate-200 px-4 rounded-xl">
          <img src={url} alt="docs" className="rounded object-cover mx-auto" />
          <div
            onClick={() => {
              setOpenImage(false);
            }}
            className="absolute cursor-pointer right-2 top-2 shadow-md z-50 p-2 rounded-full bg-rose-200 hover:bg-rose-300 text-rose-600"
          >
            <IoMdClose />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageView;
