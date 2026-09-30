import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

async function getTripPhoto(location) {
  const response = await GetPlaceDetails({ textQuery: location });
  const photoName = response.data?.places?.[0]?.photos?.[0]?.name;
  return photoName ? PHOTO_REF_URL.replace('{NAME}', photoName) : undefined;
}

function UserTripCardItem({ trip }) {
  const [photoUrl, setPhotoUrl] = useState();

  useEffect(() => {
    let active = true;
    const location = trip?.userSelection?.location?.label;
    if (location) {
      getTripPhoto(location)
        .then((url) => {
          if (active && url) setPhotoUrl(url);
        })
        .catch((error) => console.error('Unable to load saved trip photo:', error));
    }
    return () => { active = false; };
  }, [trip])

  return (
    <Link to={`/view-trip/${trip?.id}`}>
      <article className='saved-trip-card'>
        <img src={photoUrl || '/placeholder.jpg'} alt={trip?.userSelection?.location?.label ?? 'Trip destination'} />
        <div className="saved-trip-card-copy">
          <h2 className='font-bold text-lg'>{trip?.userSelection?.location?.label}</h2>
          <h2 className='text-sm text-gray-500'>{trip?.userSelection?.noOfDays} Days trip with {trip?.userSelection?.budget} budget. </h2>
        </div>
      </article>
    </Link >
  )
}

UserTripCardItem.propTypes = {
  trip: PropTypes.shape({
    userSelection: PropTypes.shape({
      location: PropTypes.shape({ label: PropTypes.string }),
      noOfDays: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      budget: PropTypes.string,
    }),
    id: PropTypes.string,
  }),
};

export default UserTripCardItem