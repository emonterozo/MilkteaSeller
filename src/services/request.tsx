import axios from 'axios';
import {SERVER_URL} from '../config/config';
import {API} from './api';
import authorization from './authorization';
import {IAddProduct, IAddStore, ILogin, IRegister, ISocial} from './types';

export const registerRequest = async (payload: IRegister) => {
  return axios
    .post(SERVER_URL + API.REGISTER, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const loginRequest = async (payload: ILogin) => {
  return axios
    .post(SERVER_URL + API.LOGIN, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const socialRequest = async (payload: ISocial) => {
  return axios
    .post(SERVER_URL + API.SOCIAL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const addStoreRequest = async (payload: IAddStore, token: String) => {
  return axios
    .post(SERVER_URL + API.ADD_STORE, payload, {
      headers: authorization(token),
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const getStoresRequest = async (owner: String, token: String) => {
  return axios
    .get(SERVER_URL + API.GET_STORES, {
      headers: authorization(token),
      params: {
        owner: owner,
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const addProductRequest = async (
  payload: IAddProduct,
  token: string,
) => {
  return axios
    .post(SERVER_URL + API.ADD_PRODUCT, payload, {
      headers: authorization(token),
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const getStoreRequest = async (id: String, token: String) => {
  return axios
    .get(SERVER_URL + API.GET_STORE, {
      headers: authorization(token),
      params: {
        id: id,
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const updateProductRequest = async (
  payload: IAddProduct,
  token: string,
) => {
  return axios
    .post(SERVER_URL + API.UPDATE_PRODUCT, payload, {
      headers: authorization(token),
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const getDashboardRequest = async (
  owner: String,
  startDate: String,
  endDate: String,
  token: String,
) => {
  return axios
    .get(SERVER_URL + API.DASHBOARD, {
      headers: authorization(token),
      params: {
        owner: owner,
        startDate: startDate,
        endDate: endDate,
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

export const getStoreSalesRequest = async (
  store: String,
  yearStartDate: String,
  yearEndDate: String,
  monthStartDate: String,
  monthEndDate: String,
  token: String,
) => {
  return axios
    .get(SERVER_URL + API.STORE_SALES, {
      headers: authorization(token),
      params: {
        store: store,
        yearStartDate: yearStartDate,
        yearEndDate: yearEndDate,
        monthStartDate: monthStartDate,
        monthEndDate: monthEndDate,
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};
