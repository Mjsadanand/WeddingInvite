import { motion } from 'framer-motion'

const timelineEvents = [
  {
    title: 'Family Blessings & Invitation',
    date: 'March 2026',
    detail: 'With the blessings of elders and families, the wedding invitation was joyfully shared with loved ones.',
  },
  {
    title: 'Reception / Wedding Program',
    date: '12 April 2026 · Around 7:30 PM',
    detail: 'An evening of celebration, greetings, photos, and dinner with family and friends.',
  },
  {
    title: 'Wedding Ceremony',
    date: '13 April 2026 · Muhurta around 12:38 PM',
    detail: 'Sacred wedding rituals and blessings as the couple begins a beautiful journey of love and togetherness.',
  },
  {
    title: 'Lunch & Blessings',
    date: '13 April 2026 · Post Ceremony',
    detail: 'A warm gathering with family elders and guests to bless the newly married couple.',
  },
]

function Timeline() {
  return (
    <div>
      <p className="section-label">Our Story</p>
      <h2>Marriage  Story Timeline</h2>
      <div className="timeline">
        {timelineEvents.map((event, index) => (
          <motion.article
            key={event.title}
            className="timeline-item"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <h3>{event.title}</h3>
            <p className="timeline-date">{event.date}</p>
            <p>{event.detail}</p>
          </motion.article>
        ))}
      </div>
    </div>
  )
}

export default Timeline
