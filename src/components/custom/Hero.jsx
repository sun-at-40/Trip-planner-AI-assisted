import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Sparkles } from 'lucide-react'

function Hero() {
  return (
    <main className="home-page">
      <section className="home-hero-copy">
        <p className="eyebrow"><Sparkles size={14} /> Your next chapter starts here</p>
        <h1>Go further.<br /><em>Feel at home.</em></h1>
        <p>Make room for the places you have been dreaming about. Shape a trip around your pace, your people, and the way you like to travel.</p>
        <Link to="/create-trip">
          <Button className="hero-cta">Plan your trip <ArrowRight size={17} /></Button>
        </Link>
      </section>
      <div className="home-product-image">
        <img src="/landing.png" alt="A preview of the trip planner showing a tailored itinerary and hotel recommendations" />
        <span className="image-caption"><Compass size={15} /> Thoughtfully planned, beautifully yours</span>
      </div>
    </main>
  )
}

export default Hero