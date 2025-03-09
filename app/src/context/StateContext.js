import { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  return (
    <StateContext.Provider value={{ messages, setMessages }}>
      {children}
    </StateContext.Provider>
  );
};

// Custom Hook to use StateContext
export const useStateContext = () => {
  return useContext(StateContext);
};
