import React from "react";
import { FiMenu, FiSearch, FiBell } from "react-icons/fi";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-200">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 focus:outline-none lg:hidden"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        {/* <div className="relative mx-4 lg:mx-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FiSearch className="w-5 h-5 text-gray-500" />
          </span>
          <input
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-indigo-500"
            type="text"
            placeholder="Search assets, personnel..."
          />
        </div> */}
      </div>

      <div className="flex items-center">
        <button className="flex mx-4 text-gray-600 focus:outline-none">
          {/* <FiBell className="w-6 h-6" /> */}
          {/* <span className="absolute top-3 right-16 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            3
          </span> */}
        </button>

        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
