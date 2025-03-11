import React from "react";
import Navbar from "../components/Navbar";
import { FaFileExport, FaFileImport } from "react-icons/fa6";
import { useStateContext } from "../context/StateContext";

function Transfer() {
  const { setMessages } = useStateContext();
  async function openDatabase() {
    window.db.open();
  }
  async function createExportFile() {
    let result = await window.db.export();
    console.log(result);
    setMessages((msgs) => [
      { id: Date.now(), text: result.message, success: result.success },
      ...msgs,
    ]);
  }
  async function ImportFile() {
    let result = await window.db.import();
    console.log(result);
    setMessages((msgs) => [
      { id: Date.now(), text: result.message, success: result.success },
      ...msgs,
    ]);
  }
  return (
    <div className="flex flex-col items-center max-h-screen h-screen">
      <Navbar route={["Data Transfer"]} />
      <div className="flex-1 w-full overflow-y-auto scrollbar-hide flex flex-wrap justify-center items-center gap-8 p-6">
        <div
          onClick={createExportFile}
          className="bg-green-700 w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center cursor-pointer space-y-1 hover:scale-105"
        >
          <FaFileExport size={50} />
          <div className="font-bold text-xl">Export</div>
          <div className="text-center">
            You can export all the latest data to the user here
          </div>
        </div>
        <div onClick={ImportFile} className="bg-indigo-700 w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center cursor-pointer space-y-1 hover:scale-105">
          <FaFileImport size={50} />
          <div className="font-bold text-xl">Import</div>
          <div className="text-center">
            You can import & update all the data here
          </div>
        </div>
      </div>
      <div
        className="px-8 py-4 my-2 text-lg font-semibold cursor-pointer text-white bg-rose-500 hover:bg-rose-600 rounded-lg"
        onClick={openDatabase}
      >
        Open DataBase in File Explorer
      </div>
    </div>
  );
}

export default Transfer;
