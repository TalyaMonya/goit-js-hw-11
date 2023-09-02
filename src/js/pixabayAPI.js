import axios from "axios";

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '39194024-d2c9e16ae0d1fd1b9e47dba55';


export class PixabayAPI {
    #page = 1;
    #per_page = 40;
    #query = '';
    #totalPhotos = 0;

    async getPhotos() {
        const params = {
            page: this.#page,
            q: this.#query,
            per_page: this.#per_page,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
        };

        const urlAXIOS = `?key=${API_KEY}`;

        const { data } = await axios.get(urlAXIOS, { params });
        return data;
    }

    get query() {
        return this.#query;
    }

    set query(newQuery) {
        this.#query = newQuery;
    }

    incrementPage() {
        this.#page += 1;
    }

    resetPage() {
        this.#page = 1
    }

    setTotal(total) {
        this.#totalPhotos = total;
    }

    hasMorePhotos() {
        return this.#page < Math.ceil(this.#totalPhotos / this.#per_page);
    }
} 
