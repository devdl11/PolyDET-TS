export interface UserCertificate {
    device_id: string,
    app_hash: string,
    public_key: string,
    certificate: string,
    private_key: string,
}

export interface IServerAPI {
    register_user(device_id: string, app_version: string, app_hash: string): UserCertificate | undefined; 
}
