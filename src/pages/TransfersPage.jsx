import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import {
  getTransfers,
  createTransfer,
  getBases,
  getAssets,
  getAssetTypes,
} from "../services/transfersService";

const TransfersPage = () => {
  const { user } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    dateFrom: "2024-01-01",
    dateTo: "2024-01-31",
    baseId:
      user?.role === "base_commander" ? user.assigned_base_id || "all" : "all",
    assetType: "all",
  });

  // Data states
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assets, setAssets] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const [form, setForm] = useState({
    asset_id: "",
    quantity: "",
    from_base_id:
      user?.role === "base_commander" ? user.assigned_base_id || "" : "",
    to_base_id: "",
  });

  // Fetch reference data on component mount
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
      } catch (err) {
        setError("Failed to load reference data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceData();
  }, [user]);

  // Fetch transfers when filters change
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const transfersData = await getTransfers(filters);
        setTransfers(transfersData);
      } catch (err) {
        setError("Failed to load transfers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!loading) {
      fetchTransfers();
    }
  }, [filters]);

  // Only show completed transfers in summary
  const completedTransfers = transfers.length;

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewTransfer = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    try {
      const transferData = {
        asset_id: form.asset_id,
        quantity: parseInt(form.quantity),
        from_base_id: form.from_base_id,
        to_base_id: form.to_base_id,
      };

      await createTransfer(transferData);

      // Refresh transfers list
      const transfersData = await getTransfers(filters);
      setTransfers(transfersData);

      // Reset form and close modal
      setForm({
        asset_id: "",
        quantity: "",
        from_base_id:
          user?.role === "base_commander" ? user.assigned_base_id || "" : "",
        to_base_id: "",
      });
      setModalOpen(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading && transfers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transfers...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transfers</h1>
          <p className="text-gray-500">Manage asset transfers between bases</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <FiPlus /> New Transfer
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <div className="text-4xl text-green-500">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500">Completed Transfers</p>
            <p className="text-2xl font-bold">{completedTransfers}</p>
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
        {(user?.role === "admin" || user?.role === "logistics_officer") && (
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

      {/* Transfers Table */}
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading transfers...
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transfers found
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 text-left">Asset</th>
                <th className="px-2 py-2 text-left">Quantity</th>
                <th className="px-2 py-2 text-left">Route</th>
                <th className="px-2 py-2 text-left">Initiated By</th>
                <th className="px-2 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-2 py-2">
                    <div className="font-semibold">{t.asset_name}</div>
                    <div className="text-xs text-gray-400">
                      {t.asset_type_name}
                    </div>
                  </td>
                  <td className="px-2 py-2">{t.quantity.toLocaleString()}</td>
                  <td className="px-2 py-2">
                    {t.from_base_name} → {t.to_base_name}
                  </td>
                  <td className="px-2 py-2">
                    {t.created_by_name || "Unknown"}
                  </td>
                  <td className="px-2 py-2">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Transfer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">New Transfer</h2>
            <form onSubmit={handleNewTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset</label>
                <select
                  name="asset_id"
                  value={form.asset_id}
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
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      From Base
                    </label>
                    <select
                      name="from_base_id"
                      value={form.from_base_id}
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
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      To Base
                    </label>
                    <select
                      name="to_base_id"
                      value={form.to_base_id}
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      To Base
                    </label>
                    <select
                      name="to_base_id"
                      value={form.to_base_id}
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
                </>
              )}
              {modalError && (
                <div className="text-red-500 text-sm">{modalError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
                disabled={modalLoading}
              >
                {modalLoading ? "Creating..." : "Create Transfer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
