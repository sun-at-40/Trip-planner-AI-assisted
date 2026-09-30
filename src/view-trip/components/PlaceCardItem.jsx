import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';

async function getPlacePhoto(placeName) {
    const response = await GetPlaceDetails({ textQuery: placeName });
    const photoName = response.data?.places?.[0]?.photos?.[0]?.name;
    return photoName ? PHOTO_REF_URL.replace('{NAME}', photoName) : undefined;
}

function PlaceCardItem({place}) {
  const [photoUrl, setPhotoUrl] = useState(place?.image_url);
    const fallbackAttempted = useRef(false);

  useEffect(() => {
        let active = true;
        fallbackAttempted.current = false;
        setPhotoUrl(place?.image_url);
        if (!place?.image_url && place?.place) {
            fallbackAttempted.current = true;
            getPlacePhoto(place.place)
                .then((url) => {
                    if (active) setPhotoUrl(url || '/placeholder.jpg');
                })
                .catch((error) => {
                    console.error('Unable to load place photo:', error);
                    if (active) setPhotoUrl('/placeholder.jpg');
                });
        }
        return () => {
            active = false;
        };
    }, [place])

    const handleImageError = () => {
        if (fallbackAttempted.current) {
            if (photoUrl !== '/placeholder.jpg') setPhotoUrl('/placeholder.jpg');
            return;
        }

        fallbackAttempted.current = true;
        getPlacePhoto(place.place)
            .then((url) => setPhotoUrl(url || '/placeholder.jpg'))
            .catch((error) => {
                console.error('Unable to load place photo:', error);
                setPhotoUrl('/placeholder.jpg');
            });
    };

  return (
    <Link to={'https://www.google.com/maps/search/?api=1&query=' +encodeURIComponent(place?.place ?? '')} target='_blank' rel="noreferrer">
    <div className='place-card border p-3 mt-2 hover:shadow-md cursor-pointer transition-all'>
        <img src={photoUrl || '/placeholder.jpg'} onError={handleImageError} alt={place?.place ?? 'Place'} className='w-[130px] h-[130px] rounded-xl object-cover' />
        <div>
            <h2 className='font-bold text-lg'>{place.place}</h2>
            <p className='text-sm text-gray-500'>{place.details}</p>
            {/* <h2>place.timetoTravel</h2> */}
            <h2 className='text-xs font-medium mt-2 mb-2'>🏷️Ticket: {place.ticket_pricing}</h2>
            {/* <Button size="sm"><FaMapLocationDot /></Button> */}
        </div>
    </div>
    </Link>
  )
}

PlaceCardItem.propTypes = {
    place: PropTypes.shape({
        place: PropTypes.string,
        details: PropTypes.string,
        image_url: PropTypes.string,
        ticket_pricing: PropTypes.string,
    }),
};

export default PlaceCardItem