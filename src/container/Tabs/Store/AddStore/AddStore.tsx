import React, {useContext, useState} from 'react';
import {
  Box,
  Icon,
  VStack,
  FormControl,
  Input,
  WarningOutlineIcon,
  Button,
  Text,
  ScrollView,
  Image,
  HStack,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {StyleSheet, TouchableOpacity} from 'react-native';
import storage from '@react-native-firebase/storage';
import uuid from 'react-native-uuid';

import {Formik} from 'formik';
import * as Yup from 'yup';
import ImagePicker from 'react-native-image-crop-picker';

import {Header} from '../../../../components';
import Map from '../Map';
import {isEmpty, isNull} from 'lodash';
import {addStoreRequest} from '../../../../services/request';
import GlobalContext from '../../../../config/context';

const schema = Yup.object().shape({
  username: Yup.string().required('This field is required'),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character',
    )
    .required('This field is required'),
  storeName: Yup.string().required('This field is required'),
  storeContactNumber: Yup.string().required('This field is required'),
  storeAddress: Yup.string().required('This field is required'),
});

const AddStore = ({navigation}) => {
  const {authenticatedUser} = useContext(GlobalContext);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [values, setValues] = useState({
    username: '',
    password: '',
    storeName: '',
    storeContactNumber: '',
    storeAddress: '',
  });
  const [coordinate, setCoordinate] = useState<any>(null);
  const [imagePath, setImagePath] = useState('');
  const [isImageErrorVisible, setIsImageErrorVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const initial = {
    username: values.username,
    password: values.password,
    storeName: values.storeName,
    storeContactNumber: values.storeContactNumber,
    storeAddress: values.storeAddress,
  };

  const handlePressBack = () => {
    if (isMapVisible) {
      setIsMapVisible(false);
    } else {
      navigation.goBack();
    }
  };

  const addStore = async setFieldError => {
    setIsLoading(true);
    const ref = `stores/${authenticatedUser.user._id}/${uuid.v4()}`;
    const storageRef = storage().ref(ref);
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
        ...coordinate,
        owner: authenticatedUser.user._id,
        banner: url,
      };

      addStoreRequest(payload, authenticatedUser.token)
        .then(res => {
          if (isEmpty(res.error)) {
            setIsLoading(false);
            navigation.navigate('Home');
          } else {
            storageRef.delete();
            setFieldError('username', res.error);
          }
        })
        .catch(err => console.log(err));
    });

    try {
      await task;
    } catch (e) {
      console.error(e);
    }
  };

  const handlePressUploadPhoto = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      cropping: true,
    }).then(image => {
      setIsImageErrorVisible(false);
      setImagePath(image.path);
    });
  };

  return (
    <Box flex={1}>
      <Header
        title="Add Store"
        hasBack
        handlePressBack={handlePressBack}
        right={
          isMapVisible && (
            <Icon
              onPress={() => setIsMapVisible(false)}
              color="white"
              as={MaterialCommunityIcons}
              name="check"
              size="xl"
              mr="3"
            />
          )
        }
      />
      {isMapVisible ? (
        <Map coordinate={coordinate} setCoordinate={setCoordinate} />
      ) : (
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
              <Button onPress={handlePressUploadPhoto} variant="link">
                Upload banner
              </Button>
            ) : (
              <TouchableOpacity
                style={styles.image}
                onPress={handlePressUploadPhoto}>
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
            onSubmit={(values, {setFieldError}) => {
              if (!isNull(coordinate)) {
                addStore(setFieldError);
              } else {
                if (!isEmpty(imagePath)) {
                  setIsMapVisible(true);
                }
              }
            }}
            validationSchema={schema}>
            {({handleChange, handleSubmit, values, errors}) => (
              <Box alignItems="center" marginY="15">
                <VStack w="90%" space={5}>
                  <FormControl isInvalid={'username' in errors}>
                    <Input
                      InputLeftElement={
                        <Icon
                          as={MaterialCommunityIcons}
                          name="account-outline"
                          color="muted.400"
                          size={5}
                          ml="2"
                        />
                      }
                      onChangeText={handleChange('username')}
                      value={values.username}
                      variant="rounded"
                      placeholder="Username"
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.username}
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={'password' in errors}>
                    <Input
                      InputLeftElement={
                        <Icon
                          as={MaterialCommunityIcons}
                          name="lock-outline"
                          color="muted.400"
                          size={5}
                          ml="2"
                        />
                      }
                      type="password"
                      onChangeText={handleChange('password')}
                      value={values.password}
                      variant="rounded"
                      placeholder="Password"
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.password}
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={'storeName' in errors}>
                    <Input
                      InputLeftElement={
                        <Icon
                          as={MaterialCommunityIcons}
                          name="storefront-outline"
                          color="muted.400"
                          size={5}
                          ml="2"
                        />
                      }
                      onChangeText={handleChange('storeName')}
                      value={values.storeName}
                      variant="rounded"
                      placeholder="Store Name"
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.storeName}
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={'storeContactNumber' in errors}>
                    <Input
                      InputLeftElement={
                        <Icon
                          as={MaterialCommunityIcons}
                          name="phone-outline"
                          color="muted.400"
                          size={5}
                          ml="2"
                        />
                      }
                      onChangeText={handleChange('storeContactNumber')}
                      value={values.storeContactNumber}
                      variant="rounded"
                      placeholder="Store Contact Number"
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.storeContactNumber}
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={'storeAddress' in errors}>
                    <Input
                      InputLeftElement={
                        <Icon
                          as={MaterialCommunityIcons}
                          name="map-marker-outline"
                          color="muted.400"
                          size={5}
                          ml="2"
                        />
                      }
                      onChangeText={handleChange('storeAddress')}
                      value={values.storeAddress}
                      variant="rounded"
                      placeholder="Store Address"
                    />
                    <FormControl.ErrorMessage
                      ml="3"
                      leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.storeAddress}
                    </FormControl.ErrorMessage>
                  </FormControl>
                </VStack>
                <Button
                  rounded="full"
                  isLoading={isLoading}
                  size="lg"
                  marginY={10}
                  w="60%"
                  onPress={() => {
                    if (isEmpty(errors)) {
                      setValues(values);
                      handleSubmit();
                    }
                  }}>
                  {isNull(coordinate) ? 'NEXT' : 'ADD'}
                </Button>
              </Box>
            )}
          </Formik>
        </ScrollView>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

export default AddStore;
