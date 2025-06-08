import EnergyConverter from './components/EnergyConverter'
import InfoSection from './components/InfoSection'
import SiteFooter from './components/SiteFooter'
import ScrollIndicator from './components/ScrollIndicator'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="site-title">context.supply</h1>
        <p className="site-tagline">tools for clearer thinking</p>
      </header>
      <EnergyConverter />
      <InfoSection />
      <SiteFooter />
      <ScrollIndicator />
    </div>
  )
}

export default App
