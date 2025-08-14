import Narrator from './components/Narrator'
import Navigator from './components/Navigator'

export default function ControlPanel() {
  return (
    <div className="control-panel">
      <h3>Logo</h3>
      <Narrator />
      <Navigator />
    </div>
  )
}