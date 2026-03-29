import { motion } from 'framer-motion'

type EventsProps = {
  language: 'en' | 'kn'
}

const eventsByLanguage = {
  en: [
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
  ],
  kn: [
    {
      title: 'ಅತಿಥಿ ಸ್ವಾಗತ',
      date: '12 ಏಪ್ರಿಲ್ 2026',
      time: 'ಸಂಜೆ 6:30 ರಿಂದ',
      description: 'ಬರುವ ಅತಿಥಿಗಳಿಗೆ ಸ್ವಾಗತ, ಕುಳಿತುಕೊಳ್ಳುವ ವ್ಯವಸ್ಥೆ ಮತ್ತು ಉಪಹಾರ ಸಿದ್ಧವಾಗಿರುತ್ತದೆ.',
    },
    {
      title: 'ರಿಸೆಪ್ಷನ್ / ಮದುವೆ ಕಾರ್ಯಕ್ರಮ',
      date: '12 ಏಪ್ರಿಲ್ 2026',
      time: 'ಸುಮಾರು ಸಂಜೆ 7:30',
      description: 'ಕುಟುಂಬದೊಂದಿಗೆ ಸಂಭ್ರಮ, ಆಶೀರ್ವಾದ, ವೇದಿಕೆ ಕಾರ್ಯಕ್ರಮ ಮತ್ತು ಊಟ.',
    },
    {
      title: 'ವರ ಆಗಮನ ಮತ್ತು ವಿಧಿಗಳು',
      date: '13 ಏಪ್ರಿಲ್ 2026',
      time: 'ಬೆಳಿಗ್ಗೆ 11:30',
      description: 'ಮುಖ್ಯ ಮದುವೆ ವಿಧಿಗೂ ಮುನ್ನ ಸಂಪ್ರದಾಯದ ಸ್ವಾಗತ ಮತ್ತು ಪೂರ್ವ ವಿಧಿಗಳು ಆರಂಭವಾಗುತ್ತವೆ.',
    },
    {
      title: 'ವಿವಾಹ ಕಾರ್ಯಕ್ರಮ',
      date: '13 ಏಪ್ರಿಲ್ 2026',
      time: 'ಮುಹೂರ್ತ ಸುಮಾರು ಮಧ್ಯಾಹ್ನ 12:38',
      description: 'ಶ್ರೀ ದಯಾನಂದ ಎಂ ಮತ್ತು ಶ್ರೀಮತಿ ಶ್ವೇತಾ (ನೇಹಾ) ಅವರ ಪವಿತ್ರ ವಿವಾಹ ಕಾರ್ಯಕ್ರಮ.',
    },
    {
      title: 'ಊಟ ಮತ್ತು ಆಶೀರ್ವಾದ',
      date: '13 ಏಪ್ರಿಲ್ 2026',
      time: 'ಮಧ್ಯಾಹ್ನ 1:30 ರಿಂದ',
      description: 'ಕುಟುಂಬ ಸಮೇತ ಊಟದ ನಂತರ ಆಶೀರ್ವಾದ ಮತ್ತು ಫೋಟೋ ಕ್ಷಣಗಳು.',
    },
  ],
} as const

function Events({ language }: EventsProps) {
  const events = eventsByLanguage[language]

  return (
    <div>
      <p className="section-label">Schedule</p>
      <h2>Wedding Festivities</h2>
      <div className="events-grid">
        {events.map((event) => (
          <motion.article
            key={event.title}
            className="event-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
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
