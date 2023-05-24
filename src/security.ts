import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import forge, {} from "node-forge"
import { UserCertificate } from "./interfaces/IServerApi";

export class Security {
  private ca_cert: string;
  private private_key: string;

  private constructor(ca: string, pk: string) {
    this.ca_cert = ca;
    this.private_key = pk;
  }

  private static removeSecFile(path: string, name: string): boolean {
    try {
      unlinkSync(path);
      return true;
    } catch (err) {
      console.error(`Cannot remove ${name} file!`);
      return false;
    }
  }

  public static new(ca: string, pk: string): Security | null {
    const caPath = path.join(ca);
    const pkPath = path.join(pk);
    if (!existsSync(caPath) || !existsSync(pkPath)) {
      return null;
    }
    return new Security(ca, pk);
  }

  public static async init_env(ca: string, pk: string): Promise<void> {
    if (existsSync(path.join(ca))) {
        if (!this.removeSecFile(ca, "cert")) {
            throw Error("Cannot remove file");
        }
    }
    if (existsSync(path.join(pk))) {
        if (!this.removeSecFile(pk, "pk")) {
            throw Error("Cannot remove file");
        }
    }

    let keys = forge.pki.rsa.generateKeyPair(2048);
    let cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(9));
    if (parseInt(cert.serialNumber[0], 16) >= 8) {
        cert.serialNumber = (parseInt(cert.serialNumber[0], 16) - 8).toString() + cert.serialNumber.substring(1);
    }
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);
    cert.setSubject([
      {
        name: "commonName",
        value: "localhost",
      },
      {
        name: "commonName",
        value: "TSPolyDET",
      },
    ]);
    cert.setIssuer([{
        name: "commonName",
        value: "TSPolyDET",
    }]);
    cert.setExtensions([
      {
        name: "basicConstraints",
        ca: true,
      },
      {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
    ]);
    cert.sign(keys.privateKey);

    let pemFormat = forge.pki.certificateToPem(cert);
    let pemKey = forge.pki.privateKeyToPem(keys.privateKey);
    writeFileSync(path.join(ca), pemFormat);
    writeFileSync(path.join(pk), pemKey);
  }

  public async generate_cert_for_user(device_id: string, app_hash: string): Promise<UserCertificate | null> {
    const ca_data = readFileSync(this.ca_cert);
    const pk_data = readFileSync(this.private_key);

    const ca_cert = forge.pki.certificateFromPem(ca_data.toString());
    const pr_key = forge.pki.privateKeyFromPem(pk_data.toString());
    let keys = forge.pki.rsa.generateKeyPair(2048);
    
    let cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(9));
    if (parseInt(cert.serialNumber[0], 16) >= 8) {
      cert.serialNumber =
        (parseInt(cert.serialNumber[0], 16) - 8).toString() +
        cert.serialNumber.substring(1);
    }
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setHours(
      cert.validity.notAfter.getHours() + 24 * 30 * 3
    );
    cert.setSubject([
      {
        name: "commonName",
        value: "PolyDETApp",
      },
    ]);
    cert.setIssuer([
      {
        name: "commonName",
        value: "TSPolyDET",
      },
    ]);
    cert.setExtensions([
      {
        name: "basicConstraints",
        ca: false,
      },
      {
        name: "keyUsage",
        keyCertSign: false,
        digitalSignature: true,
        nonRepudiation: false,
        keyEncipherment: true,
        dataEncipherment: true,
      },
    ]);
    cert.sign(pr_key);
    return {
      app_hash: app_hash,
      certificate: forge.pki.certificateToPem(cert),
      device_id: device_id,
      private_key: forge.pki.privateKeyToPem(keys.privateKey),
      public_key: forge.util.bytesToHex(forge.pki.getPublicKeyFingerprint(keys.publicKey).bytes()),
    } 
    
  }
}


