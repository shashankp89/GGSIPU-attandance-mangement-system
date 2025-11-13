
import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const DataContext = createContext();

const initialData = {
  coordinators: {},
  classes: {},
  subjects: {},
  attendance: {},
  marks: {},
  assignments: {},
  submissions: {},
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useLocalStorage('ggsipuPortalData', initialData);

  const value = {
    ...data,
    updateData: setData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
