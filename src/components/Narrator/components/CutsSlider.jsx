

function CutSelector({cut, isSelectedCut, setSelectedCut}) {
    return (
        <div
        className={`cut-selector ${isSelectedCut ? 'selected' : ''}`}
        onClick={() => setSelectedCut(cut)}>
            <div className="cut-name">
                <h4 className="cut-name-text">{cut.name}</h4>
                <div className="cut-verb">{cut.verb} by {cut.by || 'AI'}</div>
            </div>
            <div className="cut-percent">
                {cut.percent}<small>%</small>
            </div>
           
            <h3 className="cut-duration">{cut.duration}</h3>
            <div className="cut-narrate-container">
                <button className="cut-narrate">
                    Narrate
                </button>
            </div>
        </div>
    )
}

export default function CutsSlider({selectedCut, setSelectedCut, cuts}) {


  return (
    <div className={`cuts-slider cut-selected-${selectedCut.id}`}>
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
