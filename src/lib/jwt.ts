import type { webcrypto } from "crypto";
import { JWT as ZothJWT } from "zoth-node";
import { ED25519 } from "zoth-node/signature";

export interface IJWT {
  Generate(userId: string): Promise<[string, string, string, string]>;
  AccessTokenVerify(
    token: string,
    accessPublicKey: string,
  ): ReturnType<ZothJWT["VerifyAccessToken"]>;
  RefreshTokenVerify(
    token: string,
    refreshPublicKey: string,
  ): ReturnType<ZothJWT["VerifyRefreshToken"]>;
}

export class JWT extends ZothJWT implements IJWT {
  #uidKey = "sub";
  constructor(issuer: string, audience: string) {
    super(issuer, audience);
  }

  async ED25519PublicKeyToString(publicKey: webcrypto.CryptoKey) {
    // Export the key
    const exported = await crypto.subtle.exportKey("spki", publicKey);

    // Convert ArrayBuffer to Base64 string
    const uint8Array = new Uint8Array(exported);
    const binaryString = uint8Array.reduce(
      (str, byte) => str + String.fromCharCode(byte),
      "",
    );
    const exportedAsString = btoa(binaryString);

    return exportedAsString;
  }

  async StringToED25519PublicKey(base64String: string) {
    // Decode Base64 string to ArrayBuffer
    const binaryString = atob(base64String);
    const binaryDer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryDer[i] = binaryString.charCodeAt(i);
    }

    // Import the key
    return await crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "Ed25519",
        namedCurve: "Ed25519",
      },
      true,
      ["verify"],
    );
  }

  async Generate(userId: string): Promise<[string, string, string, string]> {
    const ed25519Signature = new ED25519();
    const accessKey = await ed25519Signature.GenerateKey();
    const refreshKey = await ed25519Signature.GenerateKey();

    const [accessToken, refreshToken] = await this.Sign(
      accessKey.privateKey,
      refreshKey.privateKey,
      {
        [this.#uidKey]: userId,
      },
    );

    const accessPublicKeyString = await this.ED25519PublicKeyToString(
      accessKey.publicKey,
    );
    const refreshPublicKeyString = await this.ED25519PublicKeyToString(
      refreshKey.publicKey,
    );

    return [
      accessToken,
      accessPublicKeyString,
      refreshToken,
      refreshPublicKeyString,
    ];
  }

  async AccessTokenVerify(
    token: string,
    accessPublicKey: string,
  ): ReturnType<ZothJWT["VerifyAccessToken"]> {
    const accessPublicCryptoKey =
      await this.StringToED25519PublicKey(accessPublicKey);
    const jwtPayload = await this.VerifyAccessToken(
      token,
      accessPublicCryptoKey,
    );

    const uid = jwtPayload[this.#uidKey];
    if (!uid) {
      throw new Error("token claims invalid");
    }

    return jwtPayload;
  }

  async RefreshTokenVerify(
    token: string,
    refreshPublicKey: string,
  ): ReturnType<ZothJWT["VerifyRefreshToken"]> {
    const refreshPublicCryptoKey =
      await this.StringToED25519PublicKey(refreshPublicKey);
    const jwtPayload = await this.VerifyRefreshToken(
      token,
      refreshPublicCryptoKey,
    );

    const uid = jwtPayload[this.#uidKey];
    if (!uid) {
      throw new Error("token claims invalid");
    }

    return jwtPayload;
  }
}
