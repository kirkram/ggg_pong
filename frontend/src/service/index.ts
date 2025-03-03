import axios from "axios"

export const appClient = axios.create({
    baseURL: '/app',
    withCredentials: true
});


export const info = () => appClient.get('/info').then(data => data.data)