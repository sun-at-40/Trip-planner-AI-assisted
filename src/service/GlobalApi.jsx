import axios from "axios"

const BASE_URL='https://places.googleapis.com/v1/places:searchText'

const config={
    headers:{
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
        'X-Goog-FieldMask': [
            'places.photos',
            'places.displayName',
            'places.id'
        ]
    }
}

const placeDetailsCache = new Map();
let nextPlaceRequest = Promise.resolve();

export const GetPlaceDetails = (data) => {
    const cacheKey = data?.textQuery?.trim().toLowerCase();
    if (cacheKey && placeDetailsCache.has(cacheKey)) {
        return placeDetailsCache.get(cacheKey);
    }

    const request = nextPlaceRequest.then(() => axios.post(BASE_URL, data, config));
    nextPlaceRequest = request.then(
        () => new Promise((resolve) => window.setTimeout(resolve, 300)),
        () => new Promise((resolve) => window.setTimeout(resolve, 300)),
    );

    if (cacheKey) {
        placeDetailsCache.set(cacheKey, request);
        request.catch(() => placeDetailsCache.delete(cacheKey));
    }

    return request;
}

export const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1900&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY