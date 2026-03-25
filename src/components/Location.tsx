import { motion } from 'framer-motion'

type LocationProps = {
  weddingDate: string
  weddingTime: string
  venueName: string
  lat: number
  lng: number
}

function Location({ weddingDate, weddingTime, venueName, lat, lng }: LocationProps) {
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
          <h3>Date</h3>
          <p>{weddingDate}</p>
        </article>
        <article>
          <h3>Time</h3>
          <p>{weddingTime}</p>
        </article>
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
      <button className="gold-btn" onClick={handleDirections}>
        Get Directions
      </button>
    </div>
  )
}

export default Location
