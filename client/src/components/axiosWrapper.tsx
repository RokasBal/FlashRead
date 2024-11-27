import axios, {AxiosError} from 'axios';

const getTokenFromCookie = () => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

const axiosWrapper = axios.create({
    baseURL: 'http://localhost:5076',
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosWrapper.interceptors.request.use(
    (config) => {
        const token = getTokenFromCookie();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export function isAxiosError(error: any): error is AxiosError {
    return error.isAxiosError === true;
}

export default axiosWrapper;