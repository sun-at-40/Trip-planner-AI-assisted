import { db } from '@/service/firebaseConfig';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { toast } from 'sonner';
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';

function Viewtrip() {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true;
        const getTripData = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'AITrips', tripId));
                if (!active) return;
                if (docSnap.exists()) {
                    const tripData = docSnap.data();
                    if (Array.isArray(tripData.tripData)) {
                        tripData.tripData = tripData.tripData[0] ?? {};
                    }
                    setTrip(tripData);
                } else {
                    toast('No trip found');
                }
            } catch (error) {
                console.error('Unable to load trip:', error);
                if (active) toast.error('Unable to load this trip. Check your connection and try again.');
            } finally {
                if (active) setLoading(false);
            }
        }
        if (tripId) getTripData();
        return () => { active = false; };
    }, [tripId])

    if (loading) {
        return (
            <main className="page-frame view-trip-page" aria-busy="true">
                <div className="trip-detail-skeleton">
                    <div className="skeleton-cover" />
                    <div className="skeleton-heading" />
                    <div className="skeleton-row"><i /><i /><i /></div>
                </div>
            </main>
        );
    }

    return (
        <main className='page-frame view-trip-page'>
            {/* Information Section */}
            <InfoSection trip={trip} />

            {/* Recommended Hotels */}
            <Hotels trip={trip} />

            {/* Daily Plan */}
            <PlacesToVisit trip={trip} />

        </main>
    )
}

export default Viewtrip