import { createContext, useContext, useState } from 'react';
import { cuts } from '../constants';



const DataContext = createContext({
    selectedCut: cuts[1],
    isBCard: false
})

export const DataProvider = ({ children }) => {
    const [selectedCut, setSelectedCut] = useState(cuts[1])

    const isBCard = selectedCut.id === 'BCA'

    return (
        <DataContext.Provider value={{ selectedCut, setSelectedCut, isBCard }}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = () => {
    return useContext(DataContext)
}