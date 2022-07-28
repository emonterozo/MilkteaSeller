import React, {useEffect, useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {isNull} from 'lodash';

import GlobalContext from '../config/context';
import Login from '../container/Login/Login';
import Register from '../container/Register/Register';
import {
  Store,
  AddStore,
  StoreDetails,
  StoreSales,
  AddProduct,
  Dashboard,
} from '../container/Tabs';

import {getUser} from '../utils/utils';

const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const StoreStack = createStackNavigator();

const Navigation = () => {
  const {authenticatedUser, setAuthenticatedUser} = useContext(GlobalContext);
  useEffect(() => {
    getUser()
      .then(res => setAuthenticatedUser(res))
      .catch(err => console.log(err));
  }, []);

  const StoreStackNavigator = () => {
    return (
      <StoreStack.Navigator screenOptions={{headerShown: false}}>
        <StoreStack.Screen name="Home" component={Store} />
        <StoreStack.Screen name="AddStore" component={AddStore} />
        <StoreStack.Screen name="StoreDetails" component={StoreDetails} />
        <StoreStack.Screen name="StoreSales" component={StoreSales} />
        <StoreStack.Screen name="AddProduct" component={AddProduct} />
      </StoreStack.Navigator>
    );
  };

  return (
    <NavigationContainer>
      {isNull(authenticatedUser) ? (
        <AuthStack.Navigator screenOptions={{headerShown: false}}>
          <AuthStack.Screen name="Login" component={Login} />
          <AuthStack.Screen name="Register" component={Register} />
        </AuthStack.Navigator>
      ) : (
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({color, size}) => {
              let iconName;

              if (route.name === 'Store') {
                iconName = 'store';
              } else if (route.name === 'Dashboard') {
                iconName = 'view-dashboard-outline';
              }

              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
            },
            tabBarShowLabel: false,
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}>
          <Tab.Screen
            options={{unmountOnBlur: true}}
            name="Store"
            component={StoreStackNavigator}
          />
          <Tab.Screen
            options={{unmountOnBlur: true}}
            name="Dashboard"
            component={Dashboard}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
};

export default Navigation;
