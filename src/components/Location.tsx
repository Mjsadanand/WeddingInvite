import { motion } from 'framer-motion'
import type { SVGProps } from 'react'

type LocationProps = {
  weddingDate: string
  weddingTime: string
  venueName: string
  lat: number
  lng: number
  language: 'en' | 'kn'
}

function NavigationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Location({ venueName, language }: LocationProps) {
  const contactNumbers = ['8310861235', '7829118313', '8553393038']
  const destinationLat = 14.793333
  const destinationLng = 75.399444

  const openDirections = (origin?: { latitude: number; longitude: number }) => {
    const baseUrl = 'https://www.google.com/maps/dir/?api=1'
    const destination = `&destination=${destinationLat},${destinationLng}`

    if (origin) {
      const originParam = `&origin=${origin.latitude},${origin.longitude}`
      window.open(`${baseUrl}${originParam}${destination}`, '_blank', 'noopener,noreferrer')
      return
    }

    // Let Google Maps resolve to the user's current location when exact coordinates are unavailable.
    window.open(`${baseUrl}&origin=Current+Location${destination}`, '_blank', 'noopener,noreferrer')
  }

  const handleDirections = () => {
    if (!navigator.geolocation) {
      openDirections()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        openDirections({ latitude, longitude })
      },
      () => {
        openDirections()
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="location-wrap">
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
      >
        Wedding Details
      </motion.h2>

      <div className="detail-grid">
        <article>
          <h3>Venue</h3>
          <p>{venueName}</p>
        </article>
      </div>

      <div className="map-frame">
        <iframe
          title="Wedding Venue Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3490.898062913244!2d75.39950255!3d14.793350100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb968e2ccc84825%3A0xd364fae0dc311052!2sGuru%20Bhavan%2C%20Vidya%20Nagar%2C%20Haveri%2C%20Karnataka%20581110!5e1!3m2!1sen!2sin!4v1775018084827!5m2!1sen!2sin"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="helper-text">
        {language === 'kn'
          ? 'ನಿಮ್ಮ ಇಂದಿನ ಸ್ಥಳದಿಂದ ನೇರವಾಗಿ ದಾರಿ ನೋಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ'
          : 'Tap to navigate directly from your location'}
      </p>
      <button className="primary-btn direction-btn" onClick={handleDirections}>
        <NavigationIcon style={{ width: '20px', height: '20px' }} />
        Get Directions
      </button>

      <section className="contact-panel" aria-label="Family contacts">
        <h3>{language === 'kn' ? 'ಕುಟುಂಬವನ್ನು ಸಂಪರ್ಕಿಸಿ' : 'Call Family'}</h3>
        <div className="contact-grid">
          {contactNumbers.map((number) => (
            <a key={number} className="contact-btn" href={`tel:${number}`}>
              <PhoneIcon style={{ width: '18px', height: '18px' }} />
              {number}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Location
