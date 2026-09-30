import PropTypes from 'prop-types';
import HotelCardItem from './HotelCardItem'

function Hotels({ trip }) {
    const hotels = Array.isArray(trip?.tripData?.hotel_options)
        ? trip.tripData.hotel_options
        : Array.isArray(trip?.tripData?.hotels)
            ? trip.tripData.hotels
            : [];

    return (
        <section className="trip-content-section">
            <h2 className='section-title'>A good place to stay</h2>
            <div className='hotel-grid'>
                {hotels.map((hotel, index) => (
                    <HotelCardItem key={`${hotel?.hotel_name ?? hotel?.name ?? 'hotel'}-${index}`} hotel={{
                        ...hotel,
                        name: hotel?.name ?? hotel?.hotel_name,
                        address: hotel?.address ?? hotel?.hotel_address,
                        description: hotel?.description ?? hotel?.descriptions,
                        image_url: hotel?.image_url ?? hotel?.hotel_image_url,
                    }} />
                ))}
            </div>
        </section>
    )
}

Hotels.propTypes = {
    trip: PropTypes.shape({
        tripData: PropTypes.shape({
            hotel_options: PropTypes.array,
            hotels: PropTypes.array,
        }),
    }),
};

export default Hotels