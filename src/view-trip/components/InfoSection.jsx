import { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi'

function InfoSection({ trip }) {

    const [photoUrl, setPhotoUrl] = useState();

    useEffect(() => {
        const location = trip?.userSelection?.location?.label;
        if (location) GetPlacePhoto(location);
    }, [trip])

    const GetPlacePhoto = async (location) => {
        const data = {
            textQuery: location
        }
        try {
            const response = await GetPlaceDetails(data);
            const photoName = response.data?.places?.[0]?.photos?.[0]?.name;
            if (photoName) setPhotoUrl(PHOTO_REF_URL.replace('{NAME}', photoName));
        } catch (error) {
            console.error('Unable to load destination photo:', error);
        }
    }
    
    return (
        <section className="trip-cover-section">
            <img src={photoUrl?photoUrl:'/placeholder.jpg'} alt="Destination" className='trip-cover-image w-full object-cover' />
            <div>
                <div className='my-5 flex flex-col gap-2'>
                    <h1 className='section-title'>{trip?.userSelection?.location?.label}</h1>
                    <div className='trip-meta'>
                        <span>📅 {trip?.userSelection?.noOfDays} days</span>
                        <span>💰 {trip?.userSelection?.budget} budget</span>
                        <span>👥 {trip?.userSelection?.traveler}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

InfoSection.propTypes = {
    trip: PropTypes.shape({
        userSelection: PropTypes.shape({
            location: PropTypes.shape({ label: PropTypes.string }),
            noOfDays: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            budget: PropTypes.string,
            traveler: PropTypes.string,
        }),
    }),
};

export default InfoSection