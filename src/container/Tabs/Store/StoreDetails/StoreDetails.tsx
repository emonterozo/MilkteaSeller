import React, {useContext, useEffect, useState} from 'react';
import {
  Box,
  Text,
  Image,
  HStack,
  Icon,
  VStack,
  Divider,
  Fab,
  FlatList,
  IconButton,
  Center,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {isNull} from 'lodash';

import {Header, Rating} from '../../../../components';
import {StyleSheet, View} from 'react-native';
import {calculateRating} from '../../../../utils/utils';
import {MAX_RATING} from '../../../../utils/constant';
import {getStoreRequest} from '../../../../services/request';
import GlobalContext from '../../../../config/context';
import {InformationOutline} from '../../../../assets/svg';
import {useIsFocused} from '@react-navigation/native';

const StoreDetails = ({navigation, route}) => {
  const {authenticatedUser} = useContext(GlobalContext);
  const {id} = route.params;
  const [store, setStore] = useState(null);
  const isFocused = useIsFocused();
  let row: Array<any> = [];
  let prevOpenedRow: any;

  useEffect(() => {
    getStore();
  }, [isFocused]);

  const getStore = () => {
    getStoreRequest(id, authenticatedUser.token)
      .then(res => {
        setStore({
          details: res.store,
          products: res.products,
        });
      })
      .catch(err => console.log(err));
  };

  const renderProduct = ({item, index}) => {
    const closeRow = index => {
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };

    const renderRightActions = () => {
      return (
        <Box w="25%" justifyContent="center" alignItems="center" m={2}>
          <IconButton
            icon={
              <Icon
                color="amber.900"
                as={MaterialCommunityIcons}
                name="pencil-outline"
              />
            }
            bg="green.400"
            size="lg"
            onPress={() =>
              navigation.navigate('AddProduct', {
                id: id,
                product: item,
                action: 'Update',
              })
            }
          />
        </Box>
      );
    };

    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX)
        }
        onSwipeableOpen={() => closeRow(index)}
        ref={ref => (row[index] = ref)}>
        <Box
          bg={!item.available && 'error.400'}
          key={item._id}
          mb={2}
          marginX={2}
          borderWidth="1"
          borderColor="muted.400"
          borderRadius="sm">
          <HStack>
            <Box w="40%" marginLeft="0.5" marginY="0.5">
              <Image
                alt="Banner"
                source={{uri: item.image}}
                style={styles.flex}
                borderLeftRadius="sm"
              />
            </Box>
            <VStack flex={1} marginX="1" p={1}>
              <Text>{item.name}</Text>
              <Text>{item.description}</Text>
              <Divider marginY={1} />
              {item.price_list.map(variant => (
                <HStack space={2}>
                  <Text fontWeight="bold">{`${variant.description}:`}</Text>
                  <Text fontWeight="semibold">{`PHP ${variant.price}`}</Text>
                </HStack>
              ))}
            </VStack>
          </HStack>
        </Box>
      </Swipeable>
    );
  };

  const renderRatings = () => {
    const {store_ratings} = store.details;
    const total = calculateRating([
      store_ratings[0].count,
      store_ratings[1].count,
      store_ratings[2].count,
      store_ratings[3].count,
      store_ratings[4].count,
    ]);

    return MAX_RATING.map(item => (
      <Rating
        key={item}
        name={item <= total.ratings ? 'star' : 'star-outline'}
        size="4xl"
      />
    ));
  };

  return (
    <Box flex={1}>
      <Header
        title="Store Details"
        hasBack
        handlePressBack={() => navigation.goBack()}
        right={
          <IconButton
            icon={
              <Icon
                color="white"
                as={MaterialCommunityIcons}
                name="chart-line-variant"
              />
            }
            size="lg"
            onPress={() => {
              navigation.navigate('StoreSales', {
                store: id,
              });
            }}
          />
        }
      />
      {!isNull(store) && (
        <Box flex={1}>
          <Box height="200">
            <Image
              alt="Banner"
              source={{uri: store.details.banner}}
              size="full"
              resizeMode="cover"
            />
          </Box>
          <Box p={2}>
            <HStack>{renderRatings()}</HStack>
            <VStack justifyContent="center" mt={5}>
              <Text>{store.details.store_name}</Text>
              <Text>{store.details.store_contact_number}</Text>
              <Text>{store.details.store_address}</Text>
            </VStack>
            <Divider marginY={3} />
          </Box>
          <FlatList
            data={store.products}
            renderItem={renderProduct}
            contentContainerStyle={styles.flex}
            ListEmptyComponent={
              <Center h="100%">
                <InformationOutline height={100} width={100} color="#777777" />
                <Text>No products yet</Text>
              </Center>
            }
          />
        </Box>
      )}
      <Fab
        onPress={() =>
          navigation.navigate('AddProduct', {id: id, action: 'Add'})
        }
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={
          <Icon
            color="white"
            as={MaterialCommunityIcons}
            name="plus"
            size="sm"
          />
        }
        label="Add Product"
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

export default StoreDetails;
