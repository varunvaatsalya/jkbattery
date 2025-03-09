import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { BiSolidAddToQueue } from "react-icons/bi";
import NewComplaintForm from "../components/NewComplaintForm";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowRight,
  FaExpandArrowsAlt,
} from "react-icons/fa";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { TiDocumentAdd } from "react-icons/ti";
import { formatDateTimeToIST, formatDateToIST } from "../utils/date";
import ImageView from "../components/ImageView";
import RpComplaintForm from "../components/RpComplaintForm";

let color = {
  Pending: "bg-violet-300 text-violet-700",
  Replaced: "bg-green-300 text-green-700",
  Rejected: "bg-red-300 text-red-700",
};

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenReplacedModal, setIsOpenReplacedModal] = useState(null);
  const [openImage, setOpenImage] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const url = "http://localhost:3001/uploads/";
  async function fetchComplaints() {
    setLoading(true);
    const response = await window.electron.invoke("database-operation", {
      action: "get-complaints",
      data: { page, status: selectedStatus === "all" ? "" : selectedStatus },
    });

    if (response.success) {
      setComplaints(response.complaints);
      setFilteredComplaints(response.complaints);
    } else {
      setMessage(`Error: ${response.error}`);
    }
    setLoading(false);
  }

  useEffect(() => {
    setPage(1);
  }, [selectedStatus]);
  useEffect(() => {
    if (selectedComplaint) {
      let id = selectedComplaint.complaint_id;
      if (complaints.length === 0) setSelectedComplaint(null);
      else {
        let selectedComp = complaints.find((comp) => comp.complaint_id === id);
        setSelectedComplaint(selectedComp);
      }
    }
  }, [complaints]);

  useEffect(() => {
    fetchComplaints();
  }, [page, selectedStatus]);

  const searchComplaints = (query) => {
    if (!query) return complaints;

    query = query.toLowerCase();

    let results = complaints.filter(
      (complaint) =>
        complaint.customer_name.toLowerCase().includes(query) ||
        complaint.customer_contact.toLowerCase().includes(query)
    );
    setFilteredComplaints(results);
  };

  return (
    <div className="flex flex-col bg-gray-100 items-center max-h-screen h-screen">
      <Navbar route={["Complaints"]} />
      <div className="w-full my-1 px-2 md:px-4 lg:px-8 flex justify-between items-center">
        <div className="font-bold text-2xl text-pink-600">Complaints</div>
        <input
          type="text"
          placeholder="Search Complaints..."
          onChange={(e)=>{searchComplaints(e.target.value)}}
          className="w-1/2 rounded-full py-1 px-3 bg-rose-200 shadow-md focus:outline-none focus:ring ring-rose-600 text-rose-600 font-semibold"
        />
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
      <div className="w-full flex justify-end mx-4 lg:px-8 items-center gap-2">
        {message && (
          <div className="text-red-600 font-semibold text-sm">{message}</div>
        )}
        <button
          onClick={() => setSelectedStatus("all")}
          className={
            "px-3 font-semibold cursor-pointer rounded-full border border-rose-500 " +
            (selectedStatus === "all"
              ? "bg-rose-500 text-white"
              : "text-rose-500")
          }
        >
          All
        </button>
        <button
          onClick={() => setSelectedStatus("Pending")}
          className={
            "px-3 font-semibold cursor-pointer rounded-full border border-rose-500 " +
            (selectedStatus === "Pending"
              ? "bg-rose-500 text-white"
              : "text-rose-500")
          }
        >
          Pending
        </button>
        <button
          onClick={() => setSelectedStatus("Replaced")}
          className={
            "px-3 font-semibold cursor-pointer rounded-full border border-rose-500 " +
            (selectedStatus === "Replaced"
              ? "bg-rose-500 text-white"
              : "text-rose-500")
          }
        >
          Replaced
        </button>
        <button
          onClick={() => setSelectedStatus("Rejected")}
          className={
            "px-3 font-semibold cursor-pointer rounded-full border border-rose-500 " +
            (selectedStatus === "Rejected"
              ? "bg-rose-500 text-white"
              : "text-rose-500")
          }
        >
          Rejected
        </button>
      </div>
      <div className="flex-1 w-full p-2 min-h-0 flex">
        <div className="min-w-96 w-[30%] h-full flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-hide ">
            {filteredComplaints.length > 0 ? (
              <div className="space-y-2 pr-2">
                {filteredComplaints.map((complaint, index) => (
                  <div
                    key={complaint.complaint_id}
                    onClick={() => setSelectedComplaint(complaint)}
                    className={`p-1 rounded-lg hover:bg-rose-200 w-full cursor-pointer flex text-sm font-semibold text-red-950 shadow ${
                      selectedComplaint?.complaint_id === complaint.complaint_id
                        ? "bg-rose-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="px-1">{index + 1 + "."}</div>
                    <div className="px-1 w-2/5 capatelize line-clamp-1">
                      {complaint.customer_name}
                    </div>
                    <div className="px-2 flex-1 text-center text-nowrap uppercase">
                      {formatDateToIST(complaint.created_at)}
                    </div>
                    <div
                      className={`px-2 mx-2 rounded ${color[complaint.status]}`}
                    >
                      {complaint.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="text-rose-300 text-xl">
                  <TiDocumentAdd className="size-12 mx-auto" />
                  <div className="text-center">No Records Available!</div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end">
            <div className="flex justify-center text-white rounded-lg bg-rose-500 mx-3 shadow">
              <button
                disabled={page === 1 || loading}
                onClick={() => {
                  setPage((page) => page - 1);
                }}
                className={
                  "w-8 h-8 flex justify-center items-center rounded-l-lg " +
                  (page > 1 && !loading
                    ? "hover:bg-rose-600 cursor-pointer"
                    : "text-rose-300")
                }
              >
                <FaAngleDoubleLeft />
              </button>
              <div className="text-white font-semibold w-8 h-8 flex justify-center items-center border-x border-rose-800">
                {page}
              </div>
              <button
                disabled={complaints?.length < 50 || loading}
                onClick={() => {
                  setPage((page) => page + 1);
                }}
                className={
                  "w-8 h-8 flex justify-center items-center rounded-r-lg " +
                  (complaints?.length === 50 && !loading
                    ? "hover:bg-rose-100 cursor-pointer"
                    : "text-rose-300")
                }
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-lg flex flex-col h-full">
          {selectedComplaint ? (
            <div className="flex-1 flex flex-col min-h-0 w-full p-1">
              <div className="font-bold text-xl text-center text-rose-500 pb-2">
                Complaint Details
              </div>
              <div className="bg-rose-100 font-semibold p-3 rounded-lg flex flex-col items-center">
                <div className="w-full flex justify-around items-center">
                  <div>
                    <span className="w-32 inline-block">Complaint ID:</span>
                    <span className="text-rose-600">
                      {"#" + selectedComplaint.ctid}
                    </span>
                  </div>
                  <div>
                    <span className="mx-2">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-lg ${
                        color[selectedComplaint.status]
                      }`}
                    >
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>
                {selectedComplaint.status === "Pending" && (
                  <div
                    onClick={() => setIsOpenReplacedModal(selectedComplaint)}
                    className="px-3 py-2 bg-white flex items-center cursor-pointer hover:bg-gray-50 gap-1 text-rose-500 font-semibold rounded-lg"
                  >
                    <span>Proceed</span>
                    <FaArrowRight />
                  </div>
                )}
                {selectedComplaint.status === "Rejected" && (
                  <div className="py-1 px-3 flex flex-col justify-center items-center bg-white rounded-lg">
                    <div className="text-gray-800 font-semibold border-b px-1">
                      Reason
                    </div>
                    <div className="text-red-600">
                      {"*" + selectedComplaint.remark}
                    </div>
                  </div>
                )}
                {isOpenReplacedModal && (
                  <RpComplaintForm
                    fetchComplaints={fetchComplaints}
                    isOpenReplacedModal={isOpenReplacedModal}
                    setIsOpenReplacedModal={setIsOpenReplacedModal}
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide space-y-4">
                <div className=" w-64 border-b border-rose-500 text-rose-500 font-semibold text-lg py-1 px-2">
                  1. Product Details
                </div>
                <div className="flex flex-wrap justify-around font-semibold">
                  <div>
                    <div>
                      <span className="w-32 inline-block">Company:</span>
                      <span className="text-rose-600">
                        {selectedComplaint.company_name}
                      </span>{" "}
                    </div>
                    <div>
                      <span className="w-32 inline-block">Modal:</span>
                      <span className="text-rose-600">
                        {selectedComplaint.model_name}
                      </span>{" "}
                    </div>

                    <div>
                      <span className="w-32 inline-block">Serial:</span>
                      <span className="text-rose-600">
                        {selectedComplaint.serial_no}
                      </span>{" "}
                    </div>
                  </div>
                  <div>
                    <div>
                      <span className="w-32 inline-block">Type:</span>
                      <span className="text-rose-600">
                        {selectedComplaint.product_type}
                      </span>{" "}
                    </div>
                    <div>
                      <span className="w-32 inline-block">Purchase Date:</span>
                      <span className="text-rose-600 uppercase">
                        {formatDateToIST(selectedComplaint.purchaseDate)}
                      </span>{" "}
                    </div>
                  </div>
                </div>
                <div className=" w-64 border-b border-rose-500 text-rose-500 font-semibold text-lg py-1 px-2">
                  2. Document Details
                </div>
                <div className="flex flex-wrap justify-around items-center font-semibold">
                  <div>
                    <span className="w-32 inline-block">Warrenty/Bill:</span>
                    <span className="text-rose-600">
                      {selectedComplaint.documentName}
                    </span>{" "}
                  </div>
                  <div
                    onClick={() => {
                      setOpenImage(!openImage);
                    }}
                    className="relative group rounded-lg w-24 h-32 border-2 border-rose-500 p-1"
                  >
                    <img
                      src={url + selectedComplaint.image}
                      alt="docs"
                      className="h-full w-full object-cover rounded-lg"
                    />
                    <div className="absolute cursor-pointer p-2 rounded-full bg-rose-200 hover:bg-rose-300 text-rose-500 hidden group-hover:block -right-1 -bottom-1">
                      <FaExpandArrowsAlt />
                    </div>
                  </div>
                  {openImage && (
                    <ImageView
                      url={url + selectedComplaint.image}
                      setOpenImage={setOpenImage}
                    />
                  )}
                </div>
                <div className=" w-64 border-b border-rose-500 text-rose-500 font-semibold text-lg py-1 px-2">
                  3. Customer Details
                </div>
                <div className="flex flex-wrap justify-around font-semibold">
                  <div>
                    <div>
                      <span className="px-3 w-40 inline-block">
                        Customer Name:
                      </span>
                      <span className="text-rose-600">
                        {selectedComplaint.customer_name}
                      </span>{" "}
                    </div>
                    <div>
                      <span className="px-3 w-40 inline-block">Contact:</span>
                      <span className="text-rose-600">
                        {selectedComplaint.customer_contact}
                      </span>{" "}
                    </div>
                  </div>
                  <div>
                    <div>
                      <span className="px-3">Customer ID:</span>
                      <span className="text-rose-600">
                        {"#" + selectedComplaint.cid}
                      </span>{" "}
                    </div>
                  </div>
                </div>
                <div className=" w-64 border-b border-rose-500 text-rose-500 font-semibold text-lg py-1 px-2">
                  4. Dealer Details
                </div>
                <>
                  {selectedComplaint.dealer_id &&
                  selectedComplaint.did &&
                  selectedComplaint.dealer_name &&
                  selectedComplaint.dealer_contact ? (
                    <div className="flex flex-wrap justify-around font-semibold">
                      <div>
                        <div>
                          <span className="px-3 w-40 inline-block">
                            Dealer Name:
                          </span>
                          <span className="text-rose-600">
                            {selectedComplaint.dealer_name}
                          </span>{" "}
                        </div>
                        <div>
                          <span className="px-3 w-40 inline-block">
                            Contact:
                          </span>
                          <span className="text-rose-600">
                            {selectedComplaint.dealer_contact}
                          </span>{" "}
                        </div>
                      </div>
                      <div>
                        <div>
                          <span className="px-3">Dealer ID:</span>
                          <span className="text-rose-600">
                            {"#" + selectedComplaint.did}
                          </span>{" "}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="font-bold text-gray-800 px-4">
                      *No Dealer
                    </div>
                  )}
                </>
                {selectedComplaint.replaced_product_id && (
                  <>
                    <div className=" w-64 border-b border-rose-500 text-rose-500 font-semibold text-lg py-1 px-2">
                      5. Replaced Product Details
                    </div>
                    <div className="flex flex-wrap justify-around font-semibold">
                      <div>
                        <div>
                          <span className="w-32 inline-block">Company:</span>
                          <span className="text-rose-600">
                            {selectedComplaint.rp_company_name}
                          </span>{" "}
                        </div>
                        <div>
                          <span className="w-32 inline-block">Modal:</span>
                          <span className="text-rose-600">
                            {selectedComplaint.replaced_modal_name}
                          </span>{" "}
                        </div>

                        <div>
                          <span className="w-32 inline-block">Serial:</span>
                          <span className="text-rose-600">
                            {selectedComplaint.replaced_serial_no}
                          </span>{" "}
                        </div>
                      </div>
                      <div>
                        <div>
                          <span className="w-32 inline-block">Type:</span>
                          <span className="text-rose-600">
                            {selectedComplaint.replaced_product_type}
                          </span>{" "}
                        </div>
                        <div>
                          <span className="w-32 inline-block">
                            Replaced By:
                          </span>
                          <span className="text-rose-600 uppercase">
                            {selectedComplaint.replaced_by_e_name}
                          </span>{" "}
                        </div>
                        <div>
                          <span className="w-32 inline-block">
                            Replaced Date:
                          </span>
                          <span className="text-rose-600 uppercase">
                            {formatDateToIST(selectedComplaint.replaced_at)}
                          </span>{" "}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <hr className="border-t border-rose-500 my-2" />
                <div>
                  <div className="flex flex-wrap justify-around items-center text-gray-600 font-semibold">
                    <div className="w-2/5 text-center">
                      Created by: {selectedComplaint.created_by_username}
                    </div>
                    <div className="w-2/5 text-center">
                      Modified by:{" "}
                      {selectedComplaint.modified_by_username
                        ? selectedComplaint.modified_by_username
                        : "--"}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-around items-center text-gray-600 font-semibold">
                    <div className="w-2/5 text-center">
                      Created at:{" "}
                      <span className="uppercase">
                        {formatDateTimeToIST(selectedComplaint.created_at)}
                      </span>
                    </div>
                    <div className="w-2/5 text-center">
                      Modified at:{" "}
                      {selectedComplaint.modified_at ? (
                        <span className="uppercase">
                          {formatDateTimeToIST(selectedComplaint.modified_at)}
                        </span>
                      ) : (
                        "--"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full text-gray-300 flex flex-col justify-center items-center gap-2">
              <IoDocumentAttachOutline className="size-30" />
              <div className="font-bold text-2xl ">Select the Complaint</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Complaints;
