import { createPortal } from 'react-dom'
import { useEffect } from 'react'

type PasscodeGateProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  language: 'en' | 'kn'
  passcode?: string | undefined
}

export default function PasscodeGate({ isOpen, onClose, onSuccess, language, passcode }: PasscodeGateProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (data.get('gallery-passcode') as string) || ''

    if (!passcode) {
      // If no passcode configured, allow access and close modal
      onSuccess()
      onClose()
      return
    }

    if (value.trim() === passcode.trim()) {
      onSuccess()
      onClose()
      return
    }

    // simple invalid feedback by shaking input via CSS class
    const input = event.currentTarget.querySelector('input[name="gallery-passcode"]') as HTMLInputElement | null
    if (input) {
      input.value = ''
      input.focus()
      input.classList.remove('invalid')
      // trigger reflow to restart animation
      void input.offsetWidth
      input.classList.add('invalid')
    }
  }

  return createPortal(
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal passcode-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h3>{language === 'kn' ? 'ಗ್ಯಾಲರಿಯ ಪ್ರವೇಶ' : 'Gallery Access'}</h3>
        <p>
          {language === 'kn'
            ? 'ಗ್ಯಾಲರಿಯನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ಪಾಸ್‌ಕೋಡ್ ನಮೂದಿಸಿ'
            : 'Enter the passcode to view the gallery'}
        </p>

        <form onSubmit={handleSubmit} className="preview-card">
          <input
            name="gallery-passcode"
            type="password"
            className="upload-passcode-input"
            placeholder={language === 'kn' ? 'ಪಾಸ್‌ಕೋಡ್ ನಮೂದಿಸಿ' : 'Enter passcode'}
            autoFocus
            aria-label={language === 'kn' ? 'ಪಾಸ್‌ಕೋಡ್' : 'Passcode'}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="primary-btn">
              {language === 'kn' ? 'ಪ್ರವೇಶಿಸಿ' : 'Enter'}
            </button>
            <button type="button" className="secondary-btn" onClick={onClose}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
