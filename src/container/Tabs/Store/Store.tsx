import React, {useEffect, useContext, useState} from 'react';
import {
  Box,
  Text,
  Fab,
  Icon,
  HStack,
  Image,
  VStack,
  FlatList,
  Center,
  IconButton,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {StyleSheet, TouchableOpacity} from 'react-native';

import {Header, Rating} from '../../../components';
import {getStoresRequest} from '../../../services/request';
import GlobalContext from '../../../config/context';
import {MAX_RATING} from '../../../utils/constant';
import {calculateRating} from '../../../utils/utils';
import {InformationOutline} from '../../../assets/svg';
import {useIsFocused} from '@react-navigation/native';

const Store = ({navigation, route}) => {
  const {authenticatedUser} = useContext(GlobalContext);
  const [stores, setStores] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    getStoresRequest(authenticatedUser.user._id, authenticatedUser.token)
      .then(res => setStores(res.stores))
      .catch(err => console.log(err));
  }, [isFocused]);

  const renderStore = ({item}) => {
    const {store_ratings} = item;

    const total = calculateRating([
      store_ratings[0].count,
      store_ratings[1].count,
      store_ratings[2].count,
      store_ratings[3].count,
      store_ratings[4].count,
    ]);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('StoreDetails', {id: item._id})}>
        <Box m={1} borderRadius="md" borderWidth="1" borderColor="muted.400">
          <HStack space={2}>
            <Image
              source={{
                uri: item.banner,
              }}
              alt="banner"
              size="xl"
              borderLeftRadius="md"
            />
            <VStack flex={1} p={1}>
              <VStack flex={1} justifyContent="center">
                <Text>{item.store_name}</Text>
                <Text>{item.store_contact_number}</Text>
                <Text>{item.store_address}</Text>
              </VStack>
              <HStack justifyContent="flex-end">
                {MAX_RATING.map((item, key) => (
                  <Rating
                    key={key}
                    name={item <= total.ratings ? 'star' : 'star-outline'}
                    size="3xl"
                  />
                ))}
              </HStack>
            </VStack>
          </HStack>
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <Box flex={1}>
      <Header title="Store" isLogoutVisible />
      <FlatList
        data={stores}
        renderItem={renderStore}
        contentContainerStyle={stores.length <= 0 && styles.empty}
        ListEmptyComponent={
          <Center>
            <InformationOutline height={100} width={100} color="#777777" />
            <Text>No store yet</Text>
          </Center>
        }
      />
      <Fab
        onPress={() => navigation.navigate('AddStore')}
        renderInPortal={false}
        shadow={2}
        size="lg"
        icon={
          <Icon
            color="white"
            as={MaterialCommunityIcons}
            name="plus"
            size="xl"
          />
        }
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  empty: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Store;
