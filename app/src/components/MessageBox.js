import React, { useEffect } from "react";
import { useStateContext } from "../context/StateContext";
import { RxCrossCircled } from "react-icons/rx";

function MessageBox() {
  const { messages, setMessages } = useStateContext();

  useEffect(() => {
    if (messages.length > 0) {
      const timers = messages.map((msg) =>
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        }, 4500)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [messages, setMessages]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed z-50 py-2 px-4 rounded-xl text-white w-full flex flex-col items-center gap-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={
            "flex items-center shadow-lg gap-2 p-2 font-semibold rounded-lg " +
            (msg.success ? "bg-green-500" : "bg-red-500")
          }
        >
          <div>{msg.text}</div>
          <RxCrossCircled
            onClick={() =>
              setMessages((prev) => prev.filter((m) => m.id !== msg.id))
            }
            className={`size-5 hover:text-${
              msg.success ? "green" : "red"
            }-100 cursor-pointer`}
          />
        </div>
      ))}
    </div>
  );
}

export default MessageBox;
