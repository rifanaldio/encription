import axios from "axios";

export const Fetch = () => {
    const API = axios.create({
        baseURL: `url/`,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });

    const postFile = (file) => {
        return API.post('url', file)
    }

    const encriptionFile = (file) => {
        return API.post('url', file)
    }

    const deskripFile = (file) => {
        return API.post('url', file)
    }

    const downloadFile = (file) => {
        return API.get('url', file)
    }

    const getListEncriptionFile = (file) => {
        return API.get('url', file)
    }

    const getListDecriptionFile = (file) => {
        return API.get('url', file)
    }



    return {
        postFile,
        encriptionFile,
        deskripFile,
        downloadFile,
        getListEncriptionFile,
        getListDecriptionFile
    }
}