import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FiGrid,
  FiShoppingCart,
  FiArrowRightCircle,
  FiClipboard,
  FiFileText,
  FiLogOut,
  FiBriefcase,
} from "react-icons/fi";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/dashboard",
      icon: <FiGrid className="w-5 h-5" />,
      label: "Dashboard",
    },
    {
      to: "/purchases",
      icon: <FiShoppingCart className="w-5 h-5" />,
      label: "Purchases",
    },
    {
      to: "/transfers",
      icon: <FiArrowRightCircle className="w-5 h-5" />,
      label: "Transfers",
    },
    {
      to: "/assignments",
      icon: <FiClipboard className="w-5 h-5" />,
      label: "Assignments",
    },
    // {
    //   to: "/audit-logs",
    //   icon: <FiFileText className="w-5 h-5" />,
    //   label: "Audit Logs",
    //   adminOnly: true,
    // },
  ];

  // Filter nav items based on role
  let filteredNavItems = navItems;
  if (user?.role === "logistics_officer") {
    filteredNavItems = navItems.filter((item) =>
      ["Dashboard", "Purchases", "Transfers"].includes(item.label)
    );
  } else if (user?.role !== "admin") {
    filteredNavItems = navItems.filter((item) => !item.adminOnly);
  }

  return (
    <aside
      className={`relative bg-gray-800 text-gray-100 h-screen transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-64" : "w-20"
      } lg:w-64 flex flex-col`}
    >
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <FiBriefcase
          className={`w-8 h-8 text-indigo-400 ${
            sidebarOpen ? "mr-3" : ""
          } lg:mr-3`}
        />
        <h1
          className={`text-xl font-bold whitespace-nowrap ${
            sidebarOpen ? "block" : "hidden"
          } lg:block`}
        >
          Military AMS
        </h1>
      </div>

      <div className="flex items-center p-4 mt-6">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 flex items-center justify-center bg-indigo-500 rounded-full font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className={`ml-3 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-gray-700 ${
                isActive ? "bg-gray-900" : ""
              } ${!sidebarOpen ? "justify-center" : ""}`
            }
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            title={!sidebarOpen ? item.label : ""}
          >
            {item.icon}
            <span
              className={`ml-4 whitespace-nowrap ${
                !sidebarOpen ? "hidden" : "block"
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-gray-700 ${
            !sidebarOpen ? "justify-center" : ""
          }`}
          title={!sidebarOpen ? "Logout" : ""}
        >
          <FiLogOut className="w-5 h-5" />
          <span
            className={`ml-4 whitespace-nowrap ${
              !sidebarOpen ? "hidden" : "block"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
