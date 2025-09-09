import BCard from './components/BCard'
import {useState} from "react";
import MarkdownViewer from "./markdowns/MarkdownViewer";
import cvMd from "./markdowns/01-full.md?raw"; // Vite: import file as raw text


export default function Portfolios() {

    const [ isCardActive, setIsCardActive ] = useState(false);

  return (
    <div className={`portfolios ${isCardActive ? 'card-active' : ''}`}>
      <BCard setIsCardActive={setIsCardActive}/>
        <div className="portfolios-container">
        <h1>Portfolios</h1>

        <MarkdownViewer markdown={cvMd} />
      </div>

    </div>
  )
}
