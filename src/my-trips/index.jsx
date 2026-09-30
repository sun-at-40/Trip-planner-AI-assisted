import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '@/service/firebaseConfig';
import UserTripCardItem from './components/UserTripCardItem';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass } from 'lucide-react';

function MyTrips() {
    const navigate = useNavigate();
    const [userTrips, setUserTrips] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true;
        const getUserTrips = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) {
                    navigate('/');
                    return;
                }
                const tripsQuery = query(collection(db, 'AITrips'), where('userEmail', '==', user.email));
                const snapshot = await getDocs(tripsQuery);
                if (active) setUserTrips(snapshot.docs.map((tripDoc) => tripDoc.data()));
            } catch (error) {
                console.error('Unable to load saved trips:', error);
            } finally {
                if (active) setLoading(false);
            }
        }
        getUserTrips();
        return () => { active = false; };
    }, [navigate])

    return (
        <main className='page-frame my-trips-page'>
            <header className="my-trips-heading">
                <div>
                    <p className="eyebrow">Your travel journal</p>
                    <h1 className="section-title">Trips worth remembering.</h1>
                </div>
            </header>
            <div className='trip-grid'>
                {loading ? [1, 2, 3].map((item) => (
                    <div key={item} className='saved-trip-card h-[250px] animate-pulse bg-white/60' />
                )) : userTrips.length > 0 ? userTrips.map((trip, index)=>(
                    <UserTripCardItem trip={trip} key={index} />
                )) : (
                    <div className="empty-trips-state">
                        <Compass size={24} aria-hidden="true" />
                        <h2>Your next favorite story starts with a trip.</h2>
                        <Link to="/create-trip"><Button className="hero-cta">Plan a trip <ArrowRight size={17} /></Button></Link>
                    </div>
                )}
            </div>
        </main>
    )
}

export default MyTrips