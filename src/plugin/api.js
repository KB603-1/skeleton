// import axios from "axios";

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     }
// });

// export default api;

// src/plugin/api.js

// 초대하기 기능 임시 코드 (같은 네트워크만 가능해서)
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;
