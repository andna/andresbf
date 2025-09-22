

function CutSelector({cut, isSelectedCut, setSelectedCut}) {
    const isFull = cut.id === 'FUL'
    const isBCard = cut.id === 'BCA'
    return (
<>
        <div
        className={`cut-selector cut-${cut.id} ${isSelectedCut ? 'selected' : ''}`}
        onClick={() => setSelectedCut(cut)}>
            <div className="cut-name hide-mobile">
                <h4 className="cut-name-text">{isBCard ? <><i>B</i>Card</> : cut.name}</h4>
                <div className="cut-verb">{isFull ? 'Written by me' : `AI ${cut.verb}`}</div>
            </div>
            <div className="cut-percent hide-mobile">
                {cut.percent}<small>%</small>
            </div>

            <h3 className="cut-duration">
                {cut.duration}
                <br />
                <span className="cut-duration-name">
                    {cut.name}
                </span>

            </h3>
            <div className="cut-narrate-container hide-mobile">
                <button className="cut-narrate">
                    Narrate
                </button>
            </div>
        </div>
<div className="mobile-separator">   </div>
    </>
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
