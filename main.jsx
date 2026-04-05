import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HyroxPlanner from './hyrox-planner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HyroxPlanner />
  </StrictMode>
)
