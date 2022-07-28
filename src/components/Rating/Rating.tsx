import React from 'react';
import {Icon} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Rating = ({size, name}) => {
  return (
    <Icon
      as={MaterialCommunityIcons}
      name={name}
      color="yellow.500"
      size={size}
    />
  );
};

export default Rating;
