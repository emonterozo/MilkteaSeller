import React, {useContext, useEffect, useState} from 'react';
import {
  WarningOutlineIcon,
  Box,
  Button,
  HStack,
  Icon,
  Image,
  ScrollView,
  Text,
  VStack,
  FormControl,
  Input,
  Modal,
  Radio,
} from 'native-base';
import {StyleSheet, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {isEmpty, isEqual} from 'lodash';
import {Formik} from 'formik';
import * as Yup from 'yup';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import uuid from 'react-native-uuid';

import {Header} from '../../../../components';
import GlobalContext from '../../../../config/context';
import {
  addProductRequest,
  updateProductRequest,
} from '../../../../services/request';
import {isValidURL} from '../../../../utils/utils';

const schema = Yup.object().shape({
  name: Yup.string().required('This field is required'),
  description: Yup.string().required('This field is required'),
  small: Yup.number()
    .typeError('Amount must be a number')
    .required('This field is required'),
  medium: Yup.number()
    .typeError('Amount must be a number')
    .required('This field is required'),
  large: Yup.number()
    .typeError('Amount must be a number')
    .required('This field is required'),
});

const AddProduct = ({navigation, route}) => {
  const {action} = route.params;
  const {authenticatedUser} = useContext(GlobalContext);
  const [imagePath, setImagePath] = useState('');
  const [isImageErrorVisible, setIsImageErrorVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [available, setAvailable] = useState('yes');

  const [selectedProduct] = useState({
    name: route.params?.product?.name,
    description: route.params?.product?.description,
    image: route.params?.product?.image,
    available: route.params?.product?.available,
    small: route.params?.product?.price_list[0].price,
    medium: route.params?.product?.price_list[1].price,
    large: route.params?.product?.price_list[2].price,
  });
  const [isLoading, setIsLoading] = useState(false);

  const initial = {
    name: isEqual(action, 'Update') ? route.params.product.name : '',
    description: isEqual(action, 'Update')
      ? route.params.product.description
      : '',
    small: isEqual(action, 'Update')
      ? route.params.product.price_list[0].price
      : '',
    medium: isEqual(action, 'Update')
      ? route.params.product.price_list[1].price
      : '',
    large: isEqual(action, 'Update')
      ? route.params.product.price_list[2].price
      : '',
  };

  useEffect(() => {
    if (isEqual(action, 'Update')) {
      const {product} = route.params;
      setIsImageErrorVisible(false);
      setImagePath(product.image);
      setAvailable(product.available ? 'yes' : 'no');
    }
  }, []);

  const handleOpenCamera = () => {
    setIsModalVisible(false);
    ImagePicker.openCamera({
      mediaType: 'photo',
      cropping: true,
    }).then(image => {
      setIsImageErrorVisible(false);
      setImagePath(image.path);
    });
  };

  const handleOpenGallery = () => {
    setIsModalVisible(false);
    ImagePicker.openPicker({
      mediaType: 'photo',
      cropping: true,
    }).then(image => {
      setIsImageErrorVisible(false);
      setImagePath(image.path);
    });
  };

  const updateProduct = product => {
    const payload = {
      ...product,
      productId: route.params.product._id,
    };
    updateProductRequest(payload, authenticatedUser.token)
      .then(res => {
        setIsLoading(false);
        navigation.navigate('StoreDetails', {id: route.params.id});
      })
      .catch(err => console.log(err));
  };

  const processProduct = async values => {
    setIsLoading(true);
    const ref = `products/${authenticatedUser.user._id}/${uuid.v4()}`;
    const storageRef = storage().ref(ref);

    if (isEqual(action, 'Update')) {
      let product = {
        ...values,
        available: isEqual(available, 'yes') ? true : false,
        image: imagePath,
      };

      if (!isEqual(product, selectedProduct)) {
        if (!isValidURL(imagePath)) {
          const task = storageRef.putFile(imagePath);

          task.on('state_changed', taskSnapshot => {
            console.log(
              `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
            );
          });

          task.then(async () => {
            const url = await storage().ref(ref).getDownloadURL();
            product.image = url;
            let imageRef = storage().refFromURL(selectedProduct.image);
            imageRef.delete();
            updateProduct(product);
          });

          try {
            await task;
          } catch (e) {
            console.error(e);
          }
        } else {
          updateProduct(product);
        }
      }
    } else {
      const task = storageRef.putFile(imagePath);

      task.on('state_changed', taskSnapshot => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
        );
      });

      task.then(async () => {
        const url = await storage().ref(ref).getDownloadURL();

        const payload = {
          ...values,
          storeId: route.params.id,
          available: isEqual(available, 'yes') ? true : false,
          image: url,
        };

        addProductRequest(payload, authenticatedUser.token)
          .then(res => {
            setIsLoading(false);
            navigation.navigate('StoreDetails', {id: route.params.id});
            //navigation.goBack();
          })
          .catch(err => console.log(err));
      });

      try {
        await task;
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Box flex={1}>
      <Header
        title={`${action} Product`}
        hasBack
        handlePressBack={() => navigation.goBack()}
      />
      <Modal isOpen={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Upload photo</Modal.Header>
          <Modal.Body>
            <VStack space={2}>
              <Button variant="outline" onPress={handleOpenCamera}>
                Take Photo
              </Button>
              <Button variant="outline" onPress={handleOpenGallery}>
                Choose from gallery
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <ScrollView>
        <Box
          borderWidth="1"
          borderColor={isImageErrorVisible ? 'error.500' : 'muted.400'}
          marginX="5"
          height="200"
          marginTop="5"
          justifyContent="center"
          alignItems="center">
          {isEmpty(imagePath) ? (
            <Button variant="link" onPress={() => setIsModalVisible(true)}>
              Upload photo
            </Button>
          ) : (
            <TouchableOpacity
              style={styles.image}
              onPress={() => setIsModalVisible(true)}>
              <Image alt="Banner" source={{uri: imagePath}} size="100%" />
            </TouchableOpacity>
          )}
        </Box>
        {isImageErrorVisible && (
          <HStack alignItems="center" marginX="5" marginTop="2">
            <Icon
              as={MaterialCommunityIcons}
              name="alert-circle-outline"
              color="error.500"
              size="sm"
            />
            <Text ml="1" color="error.500" fontSize="xs">
              Image is required
            </Text>
          </HStack>
        )}
        <Formik
          initialValues={initial}
          onSubmit={values => {
            if (!isImageErrorVisible) {
              processProduct(values);
            }
          }}
          validationSchema={schema}>
          {({handleChange, handleSubmit, values, errors}) => (
            <Box alignItems="center" marginY="15">
              <VStack w="90%" space={5}>
                <FormControl isInvalid={'name' in errors}>
                  <Input
                    InputLeftElement={
                      <Icon
                        as={MaterialCommunityIcons}
                        name="tea-outline"
                        color="muted.400"
                        size={5}
                        ml="2"
                      />
                    }
                    onChangeText={handleChange('name')}
                    value={values.name}
                    variant="rounded"
                    placeholder="Product Name"
                  />
                  <FormControl.ErrorMessage
                    ml="3"
                    leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.name}
                  </FormControl.ErrorMessage>
                </FormControl>
                <FormControl isInvalid={'description' in errors}>
                  <Input
                    InputLeftElement={
                      <Icon
                        as={MaterialCommunityIcons}
                        name="information-variant"
                        color="muted.400"
                        size={5}
                        ml="2"
                      />
                    }
                    onChangeText={handleChange('description')}
                    value={values.description}
                    variant="rounded"
                    placeholder="Product Description"
                  />
                  <FormControl.ErrorMessage
                    ml="3"
                    leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.description}
                  </FormControl.ErrorMessage>
                </FormControl>
                <FormControl isInvalid={'small' in errors}>
                  <Input
                    InputLeftElement={
                      <Icon
                        as={MaterialCommunityIcons}
                        name="size-s"
                        color="muted.400"
                        size="5"
                        ml="2"
                      />
                    }
                    onChangeText={handleChange('small')}
                    value={values.small?.toString()}
                    variant="rounded"
                    placeholder="Price (12 oz)"
                    keyboardType="number-pad"
                  />
                  <FormControl.ErrorMessage
                    ml="3"
                    leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.small}
                  </FormControl.ErrorMessage>
                </FormControl>
                <FormControl isInvalid={'medium' in errors}>
                  <Input
                    InputLeftElement={
                      <Icon
                        as={MaterialCommunityIcons}
                        name="size-m"
                        color="muted.400"
                        size="5"
                        ml="2"
                      />
                    }
                    onChangeText={handleChange('medium')}
                    value={values.medium?.toString()}
                    variant="rounded"
                    placeholder="Price (16 oz)"
                    keyboardType="number-pad"
                  />
                  <FormControl.ErrorMessage
                    ml="3"
                    leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.medium}
                  </FormControl.ErrorMessage>
                </FormControl>
                <FormControl isInvalid={'large' in errors}>
                  <Input
                    InputLeftElement={
                      <Icon
                        as={MaterialCommunityIcons}
                        name="size-l"
                        color="muted.400"
                        size="5"
                        ml="2"
                      />
                    }
                    onChangeText={handleChange('large')}
                    value={values.large?.toString()}
                    variant="rounded"
                    placeholder="Price (24 oz)"
                    keyboardType="number-pad"
                  />
                  <FormControl.ErrorMessage
                    ml="3"
                    leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.large}
                  </FormControl.ErrorMessage>
                </FormControl>
                <Radio.Group
                  name="myRadioGroup"
                  value={available}
                  onChange={nextValue => {
                    setAvailable(nextValue);
                  }}>
                  <HStack
                    space={3}
                    alignItems="center"
                    w="100%"
                    justifyContent="flex-end">
                    <Text>Is available?</Text>
                    <Radio value="yes" my={1}>
                      Yes
                    </Radio>
                    <Radio value="no" my={1}>
                      No
                    </Radio>
                  </HStack>
                </Radio.Group>
              </VStack>

              <Button
                isLoading={isLoading}
                onPress={handleSubmit}
                rounded="full"
                size="lg"
                marginY={10}
                w="60%">
                {action}
              </Button>
            </Box>
          )}
        </Formik>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

export default AddProduct;
