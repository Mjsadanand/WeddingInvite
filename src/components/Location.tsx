import { motion } from 'framer-motion'
import type { SVGProps } from 'react'

type LocationProps = {
  weddingDate: string
  weddingTime: string
  venueName: string
  lat: number
  lng: number
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

function Location({ venueName, lat, lng }: LocationProps) {
  const contactNumbers = ['8310861235', '7829118313', '8553393038']

  const handleDirections = () => {
    if (!navigator.geolocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener,noreferrer')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${lat},${lng}`
        window.open(url, '_blank', 'noopener,noreferrer')
      },
      () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener,noreferrer')
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
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="helper-text">Tap to navigate directly from your location</p>
      <button className="primary-btn direction-btn" onClick={handleDirections}>
        <NavigationIcon style={{ width: '20px', height: '20px' }} />
        Get Directions
      </button>

      <section className="contact-panel" aria-label="Family contacts">
        <h3>Call Family</h3>
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
