import PropTypes from 'prop-types';
import PlaceCardItem from './PlaceCardItem'

function PlacesToVisit({trip}) {
  const itinerary = Array.isArray(trip?.tripData?.itinerary)
    ? trip.tripData.itinerary
    : [];
    const hasPlaces = itinerary.some((day) =>
        (Array.isArray(day?.plan) && day.plan.length > 0) ||
        (Array.isArray(day?.places) && day.places.length > 0)
    );

  return (
    <section className="trip-content-section">
        <h2 className='section-title'>A few places to fall for</h2>
        <div>
            {!hasPlaces ? (
                <p className='mt-3 text-sm text-gray-500'>No specific places to show in this area.</p>
            ) : itinerary.map((item,index)=>(
                <div key={`${item?.day ?? 'day'}-${index}`} className='mt-5'>
                    <h2 className='font-bold text-lg'>{item.day}</h2>
                    <div className='grid md:grid-cols-2 gap-5'>
                    {(Array.isArray(item?.plan) ? item.plan : Array.isArray(item?.places) ? item.places : []).map((place, placeIndex)=> (
                        <div key={`${place?.place ?? 'place'}-${placeIndex}`} className='my-2'>
                            <h2 className='font-medium text-sm text-orange-600'>{place?.time ?? place?.best_time_to_visit}</h2>
                            <PlaceCardItem place={{
                                ...place,
                                place: place?.place ?? place?.place_name,
                                details: place?.details ?? place?.place_details,
                                image_url: place?.image_url ?? place?.place_image_url,
                            }}/>
                        </div>
                    ))}
                    </div>
                </div>
            ))}
        </div>
    </section>
  )
}

PlacesToVisit.propTypes = {
    trip: PropTypes.shape({
        tripData: PropTypes.shape({
            itinerary: PropTypes.arrayOf(PropTypes.shape({
                day: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                plan: PropTypes.array,
            })),
        }),
    }),
};

export default PlacesToVisit