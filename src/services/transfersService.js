const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getTransfers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    console.log(filters);

    if (filters.dateFrom) queryParams.append("from_date", filters.dateFrom);
    if (filters.dateTo) queryParams.append("to_date", filters.dateTo);
    if (filters.baseId && filters.baseId !== "all")
      queryParams.append("from_base_id", filters.baseId);
    if (filters.assetType && filters.assetType !== "all")
      queryParams.append("asset_type_id", filters.assetType);
    if (filters.assetId) queryParams.append("asset_id", filters.assetId);

    const response = await fetch(`${API_BASE_URL}/transfers?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transfers");
    }

    const data = await response.json();
    return data.transfers;
  } catch (error) {
    console.error("Error fetching transfers:", error);
    throw error;
  }
};

export const createTransfer = async (transferData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transfers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create transfer");
    }

    const data = await response.json();
    return data.transfer;
  } catch (error) {
    console.error("Error creating transfer:", error);
    throw error;
  }
};

export const getBases = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reference/bases`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bases");
    }

    const data = await response.json();

    return data.bases;
  } catch (error) {
    console.error("Error fetching bases:", error);
    throw error;
  }
};

export const getAssets = async (assetTypeId = null) => {
  try {
    const queryParams = new URLSearchParams();
    if (assetTypeId) queryParams.append("asset_type_id", assetTypeId);

    const response = await fetch(
      `${API_BASE_URL}/reference/assets?${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch assets");
    }

    const data = await response.json();
    return data.assets;
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
};

export const getAssetTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reference/asset-types`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch asset types");
    }

    const data = await response.json();
    return data.asset_types;
  } catch (error) {
    console.error("Error fetching asset types:", error);
    throw error;
  }
};

export const getPersonnel = async (baseId = null) => {
  try {
    const queryParams = new URLSearchParams();
    if (baseId) queryParams.append("base_id", baseId);

    const response = await fetch(
      `${API_BASE_URL}/reference/personnel?${queryParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch personnel");
    }

    const data = await response.json();
    return data.personnel;
  } catch (error) {
    console.error("Error fetching personnel:", error);
    throw error;
  }
};
