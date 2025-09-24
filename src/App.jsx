import Narrator from './components/Narrator/Narrator.jsx'
import Portfolios from './components/Portfolios/Portfolios'
import Navigator from "./components/Navigator/Navigator.jsx";
import { BreakpointProvider } from './components/BreakpointContext'
import { DataProvider } from './components/DataContext'

export default function App() {
  return (
    <BreakpointProvider>
      <DataProvider>
          <div className="app">
        <Narrator />

        <Navigator />

          <Portfolios />
        </div>
      </DataProvider>
    </BreakpointProvider>
  )
}


