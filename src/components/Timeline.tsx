import { motion } from 'framer-motion'

type TimelineProps = {
  language: 'en' | 'kn'
}

const timelineByLanguage = {
  en: [
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
  ],
  kn: [
    {
      title: 'ಕುಟುಂಬ ಆಶೀರ್ವಾದ ಮತ್ತು ಆಹ್ವಾನ',
      date: 'ಮಾರ್ಚ್ 2026',
      detail: 'ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ನಮ್ಮ ವಿವಾಹ ಆಹ್ವಾನವನ್ನು ಬಂಧು-ಮಿತ್ರರೊಂದಿಗೆ ಹಂಚಿಕೊಂಡೆವು.',
    },
    {
      title: 'ರಿಸೆಪ್ಷನ್ / ಮದುವೆ ಕಾರ್ಯಕ್ರಮ',
      date: '12 ಏಪ್ರಿಲ್ 2026 · ಸಂಜೆ ಸುಮಾರು 7:30',
      detail: 'ಕುಟುಂಬ ಮತ್ತು ಸ್ನೇಹಿತರೊಂದಿಗೆ ಸಂಭ್ರಮ, ಶುಭಾಶಯ, ಫೋಟೋ ಕ್ಷಣಗಳು ಮತ್ತು ಊಟ.',
    },
    {
      title: 'ವಿವಾಹ ಕಾರ್ಯಕ್ರಮ',
      date: '13 ಏಪ್ರಿಲ್ 2026 · ಮುಹೂರ್ತ ಸುಮಾರು ಮಧ್ಯಾಹ್ನ 12:38',
      detail: 'ಪವಿತ್ರ ವಿವಾಹ ವಿಧಿಗಳೊಂದಿಗೆ ದಂಪತಿಯ ಹೊಸ ಬದುಕಿನ ಸುಂದರ ಪ್ರಯಾಣ ಆರಂಭವಾಗುತ್ತದೆ.',
    },
    {
      title: 'ಊಟ ಮತ್ತು ಆಶೀರ್ವಾದ',
      date: '13 ಏಪ್ರಿಲ್ 2026 · ಕಾರ್ಯಕ್ರಮದ ನಂತರ',
      detail: 'ಹೊಸದಂಪತಿಗೆ ಆಶೀರ್ವಾದ ನೀಡಲು ಕುಟುಂಬ ಹಿರಿಯರು ಮತ್ತು ಅತಿಥಿಗಳ ಆತ್ಮೀಯ ಸಮಾಗಮ.',
    },
  ],
} as const

function Timeline({ language }: TimelineProps) {
  const timelineEvents = timelineByLanguage[language]

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
