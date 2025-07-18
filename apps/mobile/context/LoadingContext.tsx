// context/LoadingContext.tsx
import React, { createContext, useContext, useState } from 'react';
import Loading from '../components/Loading';

const LoadingContext = createContext({
    show: () => { },
    hide: () => { },
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    return (
        <LoadingContext.Provider value={{ show: () => setVisible(true), hide: () => setVisible(false) }}>
            {children}
            {visible && <Loading />}
        </LoadingContext.Provider>
    );
};