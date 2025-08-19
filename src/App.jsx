import Narrator from './components/Narrator/Narrator.jsx'
import Portfolios from './components/Portfolios/Portfolios'
import Navigator from "./components/Navigator/Navigator.jsx";

export default function App() {
  return (
    <div className="app">
      <Narrator />

      <Portfolios />

        <Navigator />
    </div>
  )
}


