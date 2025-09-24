import BCard from './components/BCard'
import {useState} from "react";
import MarkdownViewer from "./markdowns/MarkdownViewer";
import cvMd from "./markdowns/01-full.md?raw"; // Vite: import file as raw text
import { useData } from '../DataContext'
import { cuts } from '../../constants'


const ComponentToRender = ({setIsCardActive, selectedCut}) => {

  switch (selectedCut.id) {
    case cuts[4].id:
        return <BCard setIsCardActive={setIsCardActive}/>
    default:
        return      <div className="portfolios-container">
        <h1>Portfolios</h1>

        <MarkdownViewer markdown={cvMd} />
      </div>
     
  }
}

export default function Portfolios() {

    const [ isCardActive, setIsCardActive ] = useState(false);
    const { selectedCut } = useData()


  return (
    <div className={`portfolios portfolio-${selectedCut.id} ${isCardActive ? 'card-active' : ''}`}>
      <ComponentToRender setIsCardActive={setIsCardActive}  selectedCut={selectedCut}/>
    </div>
  )
}
