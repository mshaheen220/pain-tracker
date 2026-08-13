import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PainLogProvider } from './contexts/PainLogContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PainLogProvider>
      <App />
    </PainLogProvider>
  </React.StrictMode>,
)