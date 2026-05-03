import { useState, useEffect } from 'react'

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const formatCountdown = (endDate) => {
  const diff = new Date(endDate) - new Date()
  if (diff <= 0) return 'ENDED'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const useCountdown = (endDate) => {
  const [time, setTime] = useState(formatCountdown(endDate))
  useEffect(() => {
    const interval = setInterval(() => setTime(formatCountdown(endDate)), 1000)
    return () => clearInterval(interval)
  }, [endDate])
  return time
}
