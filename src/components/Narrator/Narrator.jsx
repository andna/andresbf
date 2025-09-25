import CutsSlider from './components/CutsSlider'
import {useState} from "react";
import { cuts } from '../../constants';
import { useData } from '../DataContext'



export default function Narrator() {

    const { selectedCut, setSelectedCut } = useData()

  return (
    <div className="narrator">

      <div className="narrator-header">
        <img src="/logo.svg" alt="abf Logo" />
      </div>

      <h3 className="narrator-action">Portfolio Length</h3>
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
