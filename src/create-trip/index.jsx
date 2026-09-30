import { Input } from '@/components/ui/input';
import { AI_PROMPT, SelectBudgetOptions, SelectTravelList } from '@/constants/options';
import { useEffect, useState } from 'react'
import PlaceAutocomplete from '@/components/custom/PlaceAutocomplete';
import { Button } from '@/components/ui/button'
import { toast } from 'sonner';
import { generateTrip } from '@/service/AIModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from "firebase/firestore";
import { db } from '@/service/firebaseConfig';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Compass, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CreateTrip() {
  const [formData, setFormData] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);

  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('Gathering places and stays...')

  const navigate = useNavigate();

  const handleInputChange = (name, value) => {

    setFormData({
      ...formData,
      [name]: value
    })
  }

  useEffect(() => {
    console.log(formData)
  }, [formData])

  const onGenerateTrip = async () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      setOpenDialog(true)
      return;
    }

    const totalDays = Number(formData?.noOfDays);
    if (
      !formData?.location?.label ||
      !Number.isInteger(totalDays) ||
      totalDays < 1 ||
      totalDays > 5 ||
      !formData?.budget ||
      !formData?.traveler
    ) {
      toast.error('Choose a destination, 1 to 5 days, a budget, and who is traveling.')
      return;
    }

    setLoadingStage('Gathering places and stays...')
    setLoading(true)
    let failureStage = 'Gemini';
    try {
      const finalPrompt = AI_PROMPT
        .replaceAll('{location}', formData.location.label)
        .replaceAll('{totalDays}', String(totalDays))
        .replace('{traveler}', formData.traveler)
        .replace('{budget}', formData.budget)

      const responseText = await generateTrip(finalPrompt);
      const tripData = JSON.parse(responseText);
      const user = JSON.parse(savedUser);
      const docId = Date.now().toString();

      failureStage = 'Firestore';
      setLoadingStage('Saving your itinerary...')
      await setDoc(doc(db, 'AITrips', docId), {
        userSelection: formData,
        tripData,
        userEmail: user.email,
        id: docId,
      });

      navigate('/view-trip/' + docId)
    } catch (error) {
      console.error(`${failureStage} trip step failed:`, error);
      const detail = error instanceof Error ? error.message : 'Unknown error';
      const message = failureStage === 'Gemini'
        ? `Gemini request failed: ${detail}`
        : `Trip generated, but saving failed: ${detail}`;
      toast.error(message.slice(0, 240))
    } finally {
      setLoading(false)
    }
  }

  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => console.log(error)
  })

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo.access_token}`,
        Accept: 'application/json',
      },
    }).then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      onGenerateTrip();
    }).catch((error) => {
      console.error("Error fetching user profile: ", error);
    });
  }


  return (
    <main className="page-frame trip-form-page">
      <header className="trip-form-heading">
        <p className="eyebrow">A little about your getaway</p>
        <h1>Let’s make it yours.</h1>
        <p>Set the essentials and we’ll bring together a trip that fits the way you want to explore.</p>
      </header>

      <div className="trip-form-fields">
        <section className="form-section">
          <h2>Where are you headed?</h2>
          <PlaceAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            onChange={(value) => handleInputChange('location', value)}
          />
        </section>

        <section className="form-section">
          <h2>How long will you be away?</h2>
          <Input
            placeholder="For example, 4 days"
            type='number'
            min="1"
            max="5"
            step="1"
            onChange={(e) => handleInputChange('noOfDays', e.target.value)}
          />
        </section>

        <section className="form-section">
          <h2>Choose your travel style</h2>
          <div className="choice-grid">
            {SelectBudgetOptions.map((item) => (
              <button key={item.id} type="button" aria-pressed={formData?.budget === item.title}
                onClick={() => handleInputChange('budget', item.title)}
                className={`choice-card ${formData?.budget === item.title ? 'selected' : ''}`}>
                <span className="choice-icon" aria-hidden="true">{item.icon}</span>
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Who’s coming along?</h2>
          <div className="choice-grid">
            {SelectTravelList.map((item) => (
              <button key={item.id} type="button" aria-pressed={formData?.traveler === item.people}
                onClick={() => handleInputChange('traveler', item.people)}
                className={`choice-card ${formData?.traveler === item.people ? 'selected' : ''}`}>
                <span className="choice-icon" aria-hidden="true">{item.icon}</span>
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="trip-form-submit">
        <Button disabled={loading} onClick={onGenerateTrip}>
          {loading ? <><AiOutlineLoading3Quarters className='h-5 w-5 animate-spin' /> Creating trip...</> : 'Create my trip'}
        </Button>
      </div>

      {loading && (
        <div className="generation-overlay">
          <section
            className="generation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="generation-title"
            aria-describedby="generation-description"
            aria-live="polite"
          >
            <div className="generation-visual" aria-hidden="true">
              <span className="generation-orbit generation-orbit-one" />
              <span className="generation-orbit generation-orbit-two" />
              <Compass className="generation-compass" size={42} strokeWidth={1.5} />
              <LoaderCircle className="generation-spinner" size={84} strokeWidth={1.25} />
            </div>
            <p className="eyebrow">Roamly travel studio</p>
            <h2 id="generation-title">Putting your trip together</h2>
            <p id="generation-description" className="generation-stage">{loadingStage}</p>
            <p className="generation-caption">Curating a route that fits your plans.</p>
          </section>
        </div>
      )}

      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" alt="logo" width="100px" className='items-center' />
              <h2 className='font-bold text-lg'>Sign In to check out your travel plan</h2>
              <p>Sign in to the App with Google authentication securely</p>
              <Button
                onClick={login}
                className="w-full mt-6 flex gap-4 items-center">
                <FcGoogle className="h-7 w-7" />Sign in With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>


    </main>
  )
}

export default CreateTrip