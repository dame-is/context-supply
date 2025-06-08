import EnergyConverter from './components/EnergyConverter'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="site-title">context.supply</h1>
        <p className="site-tagline">tools for clearer thinking</p>
      </header>
      <EnergyConverter />
    </div>
  )
}

export default App
