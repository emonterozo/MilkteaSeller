import React, {useState, useEffect, useContext} from 'react';
import {
  Box,
  Text,
  Input,
  Icon,
  VStack,
  Button,
  HStack,
  Heading,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {isEmpty} from 'lodash';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk-next';
import Spinner from 'react-native-loading-spinner-overlay';

import {loginRequest, socialRequest} from '../../services/request';
import {storeUser} from '../../utils/utils';
import GlobalContext from '../../config/context';

GoogleSignin.configure({
  webClientId: '',
});

const Login = ({navigation}) => {
  const {setAuthenticatedUser} = useContext(GlobalContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);

  useEffect(() => {
    setError('');
  }, [email, password]);

  const handlePressLogin = () => {
    if (!isEmpty(email) && !isEmpty(password)) {
      setIsLoading(true);
      loginRequest({email, password})
        .then(res => {
          setIsLoading(false);
          if (!isEmpty(res.error)) {
            setError(res.error);
          } else {
            setAuthenticatedUser(res.data);
            storeUser(res.data);
          }
        })
        .catch(() => setIsLoading(false));
    }
  };

  const socialLogin = (data, provider: string) => {
    const payload = {
      identifier: data.id,
      provider: provider,
      name: data.name,
      email: data?.email || null,
    };
    socialRequest(payload)
      .then(res => {
        setIsSpinnerVisible(false);
        setAuthenticatedUser(res.data);
        storeUser(res.data);
      })
      .catch(() => setIsSpinnerVisible(false));
  };

  const googleLogin = async () => {
    try {
      const userInfo = await GoogleSignin.signIn();
      setIsSpinnerVisible(true);
      socialLogin(userInfo.user, 'google');
    } catch (err) {
      console.log(err);
    }
  };

  const facebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        throw 'User cancelled the login process';
      }

      setIsSpinnerVisible(true);
      new GraphRequestManager().addRequest(infoRequest).start();
    } catch (err) {
      console.log(err);
    }
  };

  // get facebook user email, name
  const infoRequest = new GraphRequest(
    '/me',
    {
      parameters: {
        fields: {
          string: 'email, name, id',
        },
      },
    },
    (err, res) => {
      if (!err) {
        socialLogin(res, 'facebook');
      }
    },
  );

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <Spinner visible={isSpinnerVisible} />
      <VStack w="90%" space={1} marginBottom="10">
        <Heading color="muted.800">Welcome back!</Heading>
        <Text color="muted.400">Login with your existing account</Text>
      </VStack>
      <Text color="error.400" w="85%" mb="2">
        {error}
      </Text>
      <VStack w="90%" space={5}>
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
          onChangeText={setEmail}
          value={email}
          variant="rounded"
          placeholder="Email"
        />
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
          onChangeText={setPassword}
          value={password}
          type="password"
          variant="rounded"
          placeholder="Password"
        />
      </VStack>
      <Button
        isLoading={isLoading}
        variant="solid"
        rounded="full"
        size="lg"
        marginY={10}
        w="60%"
        onPress={handlePressLogin}>
        LOG IN
      </Button>
      <VStack w="90%" space={3} alignItems="center">
        <Text color="muted.400">Or connect using</Text>
        <HStack space={3} w="90%">
          <Button
            backgroundColor="#4267B2"
            leftIcon={
              <Icon as={MaterialCommunityIcons} name="facebook" size="md" />
            }
            size="md"
            flex={1}
            onPress={facebookLogin}>
            Facebook
          </Button>
          <Button
            backgroundColor="#DB4437"
            leftIcon={
              <Icon as={MaterialCommunityIcons} name="google" size="md" />
            }
            size="md"
            flex={1}
            onPress={googleLogin}>
            Google
          </Button>
        </HStack>
      </VStack>
      <HStack w="90%" space={1} justifyContent="center" mt={10}>
        <Text color="muted.900">Don't have account?</Text>
        <Text
          color="blue.400"
          bold
          onPress={() => navigation.navigate('Register')}>
          Sign Up
        </Text>
      </HStack>
    </Box>
  );
};

export default Login;
