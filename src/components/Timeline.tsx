import { motion } from 'framer-motion'

const timelineEvents = [
  {
    title: 'First Meet',
    date: 'February 2019',
    detail: 'A chance encounter at a family gathering became the beginning of something beautiful.',
  },
  {
    title: 'Proposal',
    date: 'August 2023',
    detail: 'Under a starlit sky, a heartfelt promise turned into a forever yes.',
  },
  {
    title: 'Engagement',
    date: 'January 2026',
    detail: 'Our families came together in joy to bless our new chapter.',
  },
  {
    title: 'Wedding',
    date: 'December 2026',
    detail: 'The sacred vows, vibrant rituals, and celebration of two souls becoming one.',
  },
]

function Timeline() {
  return (
    <div>
      <h2>Love Story Timeline</h2>
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
            <span className="timeline-dot" aria-hidden="true" />
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
