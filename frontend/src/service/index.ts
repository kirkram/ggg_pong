import axios from "axios"
import { AppInfo, AppLoginInput, AppResponse, AppLoginCodeInput, AppLoginToken, AppRegisterInput, AppResetPassword, AppChangePassword } from "./interface"

export const appClient = axios.create({
    baseURL: '/app',
    withCredentials: true
});

appClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ping-pong-jwt"); // Get token from localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Set token in header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getAppInfo = () => appClient.get<AppInfo>('/info').then(data => data.data)

export const appLogin = (data: AppLoginInput) => appClient.post<AppResponse>("/login", data).then(data => data.data)

export const appLoginCode = (data: AppLoginCodeInput) => appClient.post<AppLoginToken>("/verify-2fa", data).then(data => data.data)

export const appRegister = (data: AppRegisterInput) => appClient.post<AppResponse>("/register", data).then(data => data.data)

export const appResetPass = (data: AppResetPassword) => appClient.post<AppResponse>("/reset-password", data).then(data => data.data)

export const appChangePass = (data: AppChangePassword) => appClient.post<AppResponse>("/update-password", data).then(data => data.data)

export const appLogout = () => appClient.put<{ message: string }>('/logout').then(data => data.data);