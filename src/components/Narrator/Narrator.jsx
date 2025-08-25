import CutsSlider from './components/CutsSlider'
import {useState} from "react";

export const cuts = [
    {id: 'FUL', name: 'Full', percent: 100, verb: 'Written', by: 'me', duration: '12:23'},
    {id: 'SUM', name: 'Summary', percent: 75, verb: 'Compressed', duration: '2:23'},
    {id: 'CHA', name: 'Chart', percent: 50, verb: 'Converted', duration: '1:10'},
    {id: 'REL', name: 'Reel', percent: 25, verb: 'Generated', duration: '0:42'},
    {id: 'BCA', name: 'BCard', percent: 2.3, verb: 'Designed', by: 'me & AI', duration: '0:21'}
]

export default function Narrator() {

    const [selectedCut, setSelectedCut] = useState(cuts[1]);

  return (
    <div className="narrator">
      
      <div className="narrator-header">
        <img src="/logo.svg" alt="abf Logo" />
        <div className="abf-name">
          Andrés Bastidas Fierro
        </div>
      </div>

      <h3 className="narrator-action">Resize portfolio length</h3>
        <CutsSlider
            cuts={cuts}
            selectedCut={selectedCut}
                    setSelectedCut={setSelectedCut} />

        <div className="narrator-gradient-container">
            <div className={`narrator-gradient cut-selected-${selectedCut.id}`} />
        </div>
    </div>
  )
}
