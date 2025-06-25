import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "base_commander",
    assigned_base_id: "",
  });
  const [bases, setBases] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch bases only if the role requires it
    if (formData.role === "base_commander") {
      authService
        .getBases()
        .then((response) => {
          setBases(response.data.bases);
          if (response.data.bases.length > 0) {
            setFormData((prev) => ({
              ...prev,
              assigned_base_id: response.data.bases[0].id,
            }));
          }
        })
        .catch((err) => {
          // This will fail if the endpoint is protected, for now, we'll log it
          console.error("Failed to fetch bases:", err);
          setError(
            "Could not load list of bases. Please ensure the backend is running and accessible."
          );
        });
    }
  }, [formData.role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.role !== "base_commander") {
        delete dataToSubmit.assigned_base_id;
      }

      await authService.register(dataToSubmit);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const inputStyles =
    "w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  const labelStyles = "block text-sm font-medium text-gray-700";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Create an Account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className={labelStyles}>
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelStyles}>
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelStyles}>
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelStyles}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="role" className={labelStyles}>
              Role
            </label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              className={inputStyles}
            >
              <option value="base_commander">Base Commander</option>
              <option value="logistics_officer">Logistics Officer</option>
            </select>
          </div>
          {formData.role === "base_commander" && (
            <div>
              <label htmlFor="assigned_base_id" className={labelStyles}>
                Choose Base
              </label>
              <select
                name="assigned_base_id"
                id="assigned_base_id"
                value={formData.assigned_base_id}
                onChange={handleChange}
                className={inputStyles}
              >
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>
                    {base.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 mt-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
            >
              Register
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
