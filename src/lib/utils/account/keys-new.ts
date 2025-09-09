export interface Keys {
  key?: CryptoKey;
  keySettings: KeySettings;
}

export interface KeySettings {
  id: string;
  accountKeyCheckValue: string;
  unprotectedAccountKey?: string;
  protectedAccountKey?: string;
  protectedAccountKeyParams?: string;
  dataPassphraseDerivedKeyDerivationParams?: string;
}
