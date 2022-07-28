import React, {useContext} from 'react';
import {HStack, Icon, IconButton, Text} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {removeUser} from '../../utils/utils';
import GlobalContext from '../../config/context';

interface IHeader {
  hasBack?: boolean;
  title: string;
  handlePressBack?: () => void;
  right?: any;
  isLogoutVisible?: boolean;
}

const Header = ({
  hasBack,
  title,
  handlePressBack,
  right,
  isLogoutVisible,
}: IHeader) => {
  const {setAuthenticatedUser} = useContext(GlobalContext);
  return (
    <HStack
      bg="primary.600"
      h="12"
      alignItems="center"
      justifyContent="space-between">
      <HStack>
        {hasBack && (
          <Icon
            onPress={handlePressBack}
            color="white"
            as={MaterialCommunityIcons}
            name="arrow-left"
            size="xl"
            ml="3"
          />
        )}
        <Text fontSize="lg" color="white" ml="3">
          {title}
        </Text>
      </HStack>
      {isLogoutVisible && (
        <IconButton
          icon={
            <Icon color="white" as={MaterialCommunityIcons} name="logout" />
          }
          size="lg"
          onPress={() => {
            removeUser();
            setAuthenticatedUser(null);
          }}
        />
      )}
      {right}
    </HStack>
  );
};
export default Header;
