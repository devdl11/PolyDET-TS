export interface IDatabase {
  is_connected(): Promise<void>;
  configure(): Promise<void>;
  check_apphash(hash: &string): Promise<boolean>;
  check_appversion(version: &string): Promise<boolean>;
  check_deviceid(deviceid: &string): Promise<boolean>;
  register_new_device(deviceid: &string, public_key: &string) : Promise<boolean>;
}
