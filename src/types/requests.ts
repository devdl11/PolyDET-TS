export interface RegisterNewDevice {
    app_hash: string,
    app_version: string,
    device_id: string,
};

export interface APIError {
  error: string;
};

export interface APISuccess {
  success: string;
};

export interface APISignedDeviceResponse extends APISuccess {
  certificate: string;
  private_key: string;
};

export namespace APIResponses {
  export const ENDPOINT_API_ERROR: APIError = {
    error: "Invalid Path or Data",
  };

  export const DATABASE_API_CONNECTION_ERROR: APIError = {
    error: "Database Connection Error",
  };

  export const INVALID_APP_HASH: APIError = {
    error: "Invalid App Hash",
  };

  export const OUTDATED_APP: APIError = {
    error: "Outdated App",
  };

  export const DEVICEID_REFUSED: APIError = {
    error: "Device ID Uneligible",
  };

  export const API_UNKOWN_ERROR: APIError = {
    error: "Something Bad Happend",
  };

  export const ENDPOINT_API_SUCCESS: APISuccess = {
    success: "Operation succeed",
  };
};
