export interface IRegister {
  name: String;
  email: String;
  password: String;
}

export interface ILogin {
  email: String;
  password: String;
}

export interface ISocial {
  identifier: String;
  provider: String;
  name: String;
  email: String;
}

export interface IAddStore {
  username: String;
  password: String;
  storeName: String;
  storeContactNumber: String;
  storeAddress: String;
  latitude: Number;
  longitude: Number;
  owner: String;
  banner: String;
}

export interface IAddProduct {
  storeId: String;
  name: String;
  description: String;
  image: String;
  available: Boolean;
  small: Number;
  medium: Number;
  large: Number;
}

export interface IUpdateProduct {
  productId: String;
  name: String;
  description: String;
  image: String;
  available: Boolean;
  small: Number;
  medium: Number;
  large: Number;
}
