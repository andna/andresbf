import ControlPanel from './components/ControlPanel/ControlPanel'
import Portfolios from './components/Portfolios/Portfolios'
import Navigator from "./components/ControlPanel/components/Navigator.jsx";

export default function App() {
  return (
    <div className="app">
      <ControlPanel />

      <Portfolios />

        <Navigator />
    </div>
  )
}


