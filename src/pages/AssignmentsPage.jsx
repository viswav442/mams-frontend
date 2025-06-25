import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import {
  getAssignments,
  createAssignment,
  getAssignmentStatus,
  getBases,
  getAssets,
  getAssetTypes,
  getPersonnel,
} from "../services/assignmentsService";

const AssignmentsPage = () => {
  const { user } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    dateFrom: "2024-02-01",
    dateTo: "2024-02-28",
    baseId: user?.role === "base_commander" ? user.assigned_base_id : "all",
    assetType: "all",
  });
  const [assignments, setAssignments] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState([]);
  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assets, setAssets] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [form, setForm] = useState({
    asset: "",
    quantity: "",
    base: user?.role === "base_commander" ? user.assigned_base_id : "",
    personnel: "",
  });

  // Fetch reference data on mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setLoading(true);
        const [basesData, assetTypesData, assetsData] = await Promise.all([
          getBases(),
          getAssetTypes(),
          getAssets(),
        ]);
        setBases(basesData);
        setAssetTypes(assetTypesData);
        setAssets(assetsData);
        // Fetch personnel for base commander
        if (user?.role === "base_commander") {
          const personnelData = await getPersonnel(user.assigned_base_id);
          setPersonnel(personnelData);
        } else {
          setPersonnel([]);
        }
      } catch (err) {
        setError("Failed to load reference data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferenceData();
  }, [user]);

  // Fetch assignments and status when filters change
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const [assignmentsData, statusData] = await Promise.all([
          getAssignments(filters),
          getAssignmentStatus(filters),
        ]);
        setAssignments(assignmentsData);
        setAssignmentStatus(statusData);
      } catch (err) {
        setError("Failed to load assignments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [filters]);

  // Map assignment id to expended
  const expendedMap = assignmentStatus.reduce((acc, s) => {
    acc[s.assignment_id] = s.expended;
    return acc;
  }, {});

  // Summary
  const totalAssigned = assignments.reduce((sum, a) => sum + a.quantity, 0);
  const totalExpended = assignments.reduce(
    (sum, a) => sum + Number(expendedMap[a.id] || 0),
    0
  );

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewAssignment = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    try {
      let assignmentData;
      if (user?.role === "admin") {
        assignmentData = {
          base_id: form.base,
          asset_id: form.asset,
          quantity: parseInt(form.quantity),
          personnel_id: null,
        };
      } else {
        assignmentData = {
          base_id: user.assigned_base_id,
          asset_id: form.asset,
          quantity: parseInt(form.quantity),
          personnel_id: form.personnel,
        };
      }
      await createAssignment(assignmentData);
      // Refresh assignments
      const [assignmentsData, statusData] = await Promise.all([
        getAssignments(filters),
        getAssignmentStatus(filters),
      ]);
      setAssignments(assignmentsData);
      setAssignmentStatus(statusData);
      setForm({
        asset: "",
        quantity: "",
        base: user?.role === "base_commander" ? user.assigned_base_id : "",
        personnel: "",
      });
      setModalOpen(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
          <p className="text-gray-500">Assign assets to bases or personnel</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <FiPlus /> New Assignment
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <div className="text-4xl text-blue-500">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500">Assigned</p>
            <p className="text-2xl font-bold">{totalAssigned}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <div className="text-4xl text-red-500">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v5.59l4.3 4.3-1.42 1.42L11 13.41V7h2Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500">Expended</p>
            <p className="text-2xl font-bold">{totalExpended}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
        <span className="font-semibold">Filters:</span>
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className="p-2 border rounded-md w-full lg:w-auto"
        />
        <span>to</span>
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className="p-2 border rounded-md w-full lg:w-auto"
        />
        {user?.role === "admin" && (
          <select
            name="baseId"
            value={filters.baseId}
            onChange={handleFilterChange}
            className="p-2 border rounded-md w-full lg:w-auto"
          >
            <option value="all">All Bases</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </select>
        )}
        <select
          name="assetType"
          value={filters.assetType}
          onChange={handleFilterChange}
          className="p-2 border rounded-md w-full lg:w-auto"
        >
          <option value="all">All Types</option>
          {assetTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No assignments found
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 text-left">Asset</th>
                <th className="px-2 py-2 text-left">Quantity</th>
                <th className="px-2 py-2 text-left">Assigned To</th>
                <th className="px-2 py-2 text-left">Expended</th>
                <th className="px-2 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="px-2 py-2">
                    <div className="font-semibold">
                      {assets.find((as) => as.id === a.asset_id)?.name || ""}
                    </div>
                    <div className="text-xs text-gray-400">
                      {assetTypes.find(
                        (at) =>
                          at.id ===
                          assets.find((as) => as.id === a.asset_id)
                            ?.asset_type_id
                      )?.name || ""}
                    </div>
                  </td>
                  <td className="px-2 py-2">{a.quantity}</td>
                  <td className="px-2 py-2">
                    {user?.role === "admin"
                      ? bases.find((b) => b.id === a.base_id)?.name
                      : personnel.find((p) => p.id === a.personnel_id)?.name}
                  </td>
                  <td className="px-2 py-2">{expendedMap[a.id] || 0}</td>
                  <td className="px-2 py-2">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Assignment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">New Assignment</h2>
            <form onSubmit={handleNewAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset</label>
                <select
                  name="asset"
                  value={form.asset}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  required
                  min="1"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              {user?.role === "admin" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Base</label>
                  <select
                    name="base"
                    value={form.base}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Base</option>
                    {bases.map((base) => (
                      <option key={base.id} value={base.id}>
                        {base.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Personnel
                  </label>
                  <select
                    name="personnel"
                    value={form.personnel}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Personnel</option>
                    {personnel.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {modalError && (
                <div className="text-red-500 text-sm">{modalError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
                disabled={modalLoading}
              >
                {modalLoading ? "Assigning..." : "Create Assignment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
