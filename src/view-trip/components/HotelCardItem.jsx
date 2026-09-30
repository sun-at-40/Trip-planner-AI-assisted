import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'

async function getHotelPhoto(hotel) {
    const response = await GetPlaceDetails({
        textQuery: `${hotel.name}, ${hotel.address ?? ''}`,
    });
    const photoName = response.data?.places?.[0]?.photos?.[0]?.name;
    return photoName ? PHOTO_REF_URL.replace('{NAME}', photoName) : undefined;
}

function HotelCardItem({ hotel }) {
    const [photoUrl, setPhotoUrl] = useState(hotel?.image_url);
    const fallbackAttempted = useRef(false);

    useEffect(() => {
        let active = true;
        fallbackAttempted.current = false;
        setPhotoUrl(hotel?.image_url);
        if (!hotel?.image_url && hotel?.name) {
            fallbackAttempted.current = true;
            getHotelPhoto(hotel)
                .then((url) => {
                    if (active) setPhotoUrl(url || '/placeholder.jpg');
                })
                .catch((error) => {
                    console.error('Unable to load hotel photo:', error);
                    if (active) setPhotoUrl('/placeholder.jpg');
                });
        }
        return () => {
            active = false;
        };
    }, [hotel])

    const handleImageError = () => {
        if (fallbackAttempted.current) {
            if (photoUrl !== '/placeholder.jpg') setPhotoUrl('/placeholder.jpg');
            return;
        }

        fallbackAttempted.current = true;
        getHotelPhoto(hotel)
            .then((url) => setPhotoUrl(url || '/placeholder.jpg'))
            .catch((error) => {
                console.error('Unable to load hotel photo:', error);
                setPhotoUrl('/placeholder.jpg');
            });
    };

    return (
        <Link className="hotel-card" to={'https://www.google.com/maps/search/?api=1&query=' + hotel?.name + "," + hotel?.address} target='_blank' rel="noreferrer">
                <img src={photoUrl || '/placeholder.jpg'} onError={handleImageError} alt={hotel?.name ?? 'Hotel'} className='hotel-card-image' />
                <div className='hotel-card-copy'>
                    <h3>{hotel?.name}</h3>
                    <p>📍 {hotel?.address}</p>
                    <p className="hotel-price">💰 {hotel?.price}</p>
                    <p>⭐ {hotel?.rating}</p>
                </div>
        </Link>
    )
}

HotelCardItem.propTypes = {
    hotel: PropTypes.shape({
        name: PropTypes.string,
        address: PropTypes.string,
        image_url: PropTypes.string,
        price: PropTypes.string,
        rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
};

export default HotelCardItem