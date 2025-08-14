import { useState } from 'react';

const cuts = [
    {id: 'FUL', name: 'Full', percent: 100, verb: 'Written', by: 'me'}, 
    {id: 'SUM', name: 'Summary', percent: 75, verb: 'Compressed'}, 
    {id: 'CHA', name: 'Chart', percent: 50, verb: 'Converted'},
    {id: 'REL', name: 'Reel', percent: 25, verb: 'Generated'},
    {id: 'BCA', name: 'BCard', percent: 2.3, verb: 'Designed', by: 'me & AI'}
]

function CutSelector({cut, isSelectedCut, setSelectedCut}) {
    return (
        <div
        className={`cut-selector ${isSelectedCut ? 'selected' : ''}`} 
        onClick={() => setSelectedCut(cut)}>
            <div className="cut-percent">
                {cut.percent}<small>%</small>
            </div>
            <div className="cut-name">
                <div className="cut-name-text">{cut.name}</div>
                <div className="cut-verb">{cut.verb} by {cut.by || 'AI'}</div>
            </div>
            <div className="cut-duration">      
                <div>1:23</div>
            </div>
            <button className="cut-narrate">
                Narrate
            </button>
        </div>
    )
}

export default function CutsSlider() {

    const [selectedCut, setSelectedCut] = useState(cuts[1]);

  return (
    <div className="cuts-slider">
    {cuts.map((cut) => (
        <CutSelector 
            key={cut.id} 
            cut={cut} 
            isSelectedCut={selectedCut === cut}
            setSelectedCut={setSelectedCut}
        />
    ))}
</div>
  )
}