import { useEffect, useRef } from 'react'

const ParticleBackground = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles = []
    for (let i = 0; i < 25; i++) {
      const el = document.createElement('div')
      el.classList.add('particle')
      const size = Math.random() * 200 + 80
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.15 + 0.03};
        animation-delay: ${Math.random() * 8}s;
        animation-duration: ${Math.random() * 8 + 8}s;
      `
      container.appendChild(el)
      particles.push(el)
    }
    return () => particles.forEach(p => p.remove())
  }, [])

  return <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" />
}

export default ParticleBackground
