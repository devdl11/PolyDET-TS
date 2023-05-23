export interface IDatabase {
  is_connected(): boolean;
  configure(): boolean;
  check_apphash(hash: &string): boolean | undefined;
  check_appversion(version: &string): boolean | undefined;
  check_deviceid(deviceid: &string): boolean | undefined;
  register_new_device(deviceid: &string, public_key: &string) : boolean;
}
