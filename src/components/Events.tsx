import { motion } from 'framer-motion'

const events = [
  {
    title: 'Haldi 🌼',
    date: '10 Dec 2026',
    time: '10:30 AM',
    description: 'A joyful morning of turmeric blessings, laughter, and sunshine hues.',
  },
  {
    title: 'Mehendi 💚',
    date: '11 Dec 2026',
    time: '4:30 PM',
    description: 'Henna artistry, music, and dance with loved ones in festive green elegance.',
  },
  {
    title: 'Wedding 🔥',
    date: '12 Dec 2026',
    time: '6:30 PM',
    description: 'Sacred pheras by the holy fire, followed by a grand celebratory reception.',
  },
]

function Events() {
  return (
    <div>
      <h2>Wedding Festivities</h2>
      <div className="events-grid">
        {events.map((event) => (
          <motion.article
            key={event.title}
            className="event-card"
            whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(255, 215, 0, 0.3)' }}
            transition={{ duration: 0.3 }}
          >
            <h3>{event.title}</h3>
            <p>{event.date} · {event.time}</p>
            <p>{event.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  )
}

export default Events
