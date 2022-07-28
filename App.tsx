import 'react-native-gesture-handler';
import React, {useState} from 'react';
import {NativeBaseProvider} from 'native-base';

import GlobalContext from './src/config/context';
import Navigation from './src/navigation/Navigation';

const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const initialContext = {
    authenticatedUser,
    setAuthenticatedUser,
  };

  return (
    <GlobalContext.Provider value={initialContext}>
      <NativeBaseProvider>
        <Navigation />
      </NativeBaseProvider>
    </GlobalContext.Provider>
  );
};

export default App;
