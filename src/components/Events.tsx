import { motion } from 'framer-motion'

const events = [
  {
    title: 'Guest Welcome',
    date: '12 Apr 2026',
    time: '6:30 PM Onwards',
    description: 'Welcome desk opens for arriving guests with seating support and refreshments.',
  },
  {
    title: 'Reception / Wedding Program',
    date: '12 Apr 2026',
    time: 'Around 7:30 PM',
    description: 'Evening celebration with family, blessings, stage moments, and dinner.',
  },
  {
    title: 'Groom Arrival & Rituals',
    date: '13 Apr 2026',
    time: '11:30 AM',
    description: 'Traditional welcome and pre-muhurta rituals begin before the main ceremony.',
  },
  {
    title: 'Wedding Ceremony',
    date: '13 Apr 2026',
    time: 'Muhurta around 12:38 PM',
    description: 'Sacred marriage ceremony as Mr. Dayanand M and Ms. Shweta (Neha) begin their new journey.',
  },
  {
    title: 'Lunch & Blessings',
    date: '13 Apr 2026',
    time: '1:30 PM Onwards',
    description: 'Family lunch followed by blessings and photographs with relatives and friends.',
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
