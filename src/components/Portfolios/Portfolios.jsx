import BCard from './components/BCard'
import {useState} from "react";

export default function Portfolios() {

    const [ isCardActive, setIsCardActive ] = useState(false);

  return (
    <div className={`portfolios ${isCardActive ? 'card-active' : ''}`}>
      <BCard setIsCardActive={setIsCardActive}/>
        <div className="portfolios-container">
        <h1>Portfolios</h1>
      </div>

    </div>
  )
}
