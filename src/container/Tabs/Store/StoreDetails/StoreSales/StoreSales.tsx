import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Box,
  Text,
  ScrollView,
  Divider,
  Center,
  AlertDialog,
  Heading,
  HStack,
} from 'native-base';
import {Dimensions, StyleSheet, View} from 'react-native';
import {LineChart, PieChart} from 'react-native-gifted-charts';
import {isNull, sumBy} from 'lodash';
import moment from 'moment';

import {Header} from '../../../../../components';
import {getStoreSalesRequest} from '../../../../../services/request';
import GlobalContext from '../../../../../config/context';
import {formatAmount} from '../../../../../utils/utils';
import InformationOutline from '../../../../../assets/svg/InformationOutline/InfoOutline';

const StoreSales = ({navigation, route}) => {
  const {authenticatedUser} = useContext(GlobalContext);
  const [isNoData, setIsNoData] = useState(true);
  const [graphData, setGraphData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const {store} = route.params;
  const timestamp = {
    startDate: `${moment().year()}-01-01`,
    endDate: moment().format('YYYY-MM-DD'),
  };
  const storeSales = {
    startDate: '2022-07-01',
    endDate: moment().format('YYYY-MM-DD'),
  };
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const cancelRef = useRef(null);

  const customDataPoint = () => <View style={styles.dataPoint} />;

  const getSales = () => {
    getStoreSalesRequest(
      store,
      timestamp.startDate,
      timestamp.endDate,
      storeSales.startDate,
      storeSales.endDate,
      authenticatedUser.token,
    )
      .then(res => {
        if (res.data) {
          setIsNoData(false);
          const {store_monthly_sales, product_monthly_sales} = res.data;
          const data = store_monthly_sales.map(item => {
            return {
              value: item.revenue,
              label: item.month,
              dataPointText: formatAmount(item.revenue),
              customDataPoint: customDataPoint,
            };
          });
          const data1 = product_monthly_sales.map((item, index) => {
            return {
              value: item.quantity,
              data: {
                name: item.name,
                sales: item.sales,
              },
            };
          });
          setPieData(data1);
          setGraphData(data);
        }
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    getSales();
  }, []);

  return (
    <Box flex={1}>
      <Header
        title="Sales"
        hasBack
        handlePressBack={() => navigation.goBack()}
      />
      {isNoData ? (
        <Center flex={1}>
          <InformationOutline height={100} width={100} color="#777777" />
          <Text>No available data to show</Text>
        </Center>
      ) : (
        <ScrollView>
          <HStack
            alignItems="center"
            marginX={2}
            marginTop={5}
            justifyContent="space-between">
            <Heading size="md">Store Sales</Heading>
            <Text fontSize="sm" color="gray.500" alignSelf="flex-end">
              {`${moment(timestamp.startDate).format(
                'MMM DD, YYYY',
              )} - ${moment(timestamp.endDate).format('MMM DD, YYYY')}`}
            </Text>
          </HStack>
          {!isNull(graphData) && (
            <LineChart
              areaChart
              curved
              data={graphData}
              width={Dimensions.get('window').width - 80}
              height={300}
              spacing={80}
              color="#177AD5"
              thickness={2}
              startFillColor="rgba(23, 120, 213,3)"
              endFillColor="rgba(23, 100, 233,1)"
              startOpacity={0.9}
              endOpacity={0.2}
              initialSpacing={25}
              noOfSections={6}
              yAxisLabelSuffix=" php"
              yAxisLabelWidth={65}
              yAxisColor="white"
              yAxisThickness={0}
              rulesType="solid"
              rulesColor="lightgray"
              xAxisColor="lightgray"
              yAxisTextStyle={styles.yAxisLabel}
              xAxisLabelTextStyle={styles.xAxisLabel}
              dataPointsHeight={6}
              dataPointsWidth={6}
              textShiftY={1}
              textShiftX={11}
              textFontSize={16}
              textColor1="#36454f"
            />
          )}
          <Center>
            <Divider marginTop={10} w="90%" />
          </Center>
          <HStack
            alignItems="center"
            marginX={2}
            marginY={5}
            justifyContent="space-between">
            <Heading size="md">Product Sales</Heading>
            <Text fontSize="sm" color="gray.500" alignSelf="flex-end">
              {`${moment(storeSales.startDate).format(
                'MMM DD, YYYY',
              )} - ${moment(storeSales.endDate).format('MMM DD, YYYY')}`}
            </Text>
          </HStack>
          <Box alignItems="center" justifyContent="center">
            {!isNull(pieData) && (
              <PieChart
                strokeColor="#36454f"
                strokeWidth={3}
                donut
                data={pieData}
                innerCircleColor="#36454f"
                innerCircleBorderWidth={4}
                innerCircleBorderColor="white"
                showValuesAsLabels={true}
                //showText
                textBackgroundColor="#36454f"
                textColor="white"
                showTextBackground={true}
                onPress={(item, index) => {
                  setIsOpen(true);
                  setSelectedProduct(
                    `${item.data.name} (${item.value} item sold)`,
                  );
                }}
                centerLabelComponent={() => {
                  return (
                    <Center>
                      <Text fontSize="xl" color="white" fontWeight="bold">
                        {sumBy(pieData, 'value')}
                      </Text>
                      <Text color="white">Total</Text>
                    </Center>
                  );
                }}
              />
            )}
          </Box>
          <AlertDialog
            leastDestructiveRef={cancelRef}
            onClose={() => setIsOpen(false)}
            isOpen={isOpen}>
            <AlertDialog.Content>
              <AlertDialog.CloseButton />
              <AlertDialog.Header>{selectedProduct}</AlertDialog.Header>
            </AlertDialog.Content>
          </AlertDialog>
        </ScrollView>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  dataPoint: {
    width: 20,
    height: 20,
    marginTop: 20,
    borderWidth: 3,
    borderRadius: 10,
    zIndex: -1,
    backgroundColor: 'white',
    borderColor: '#177AD5',
  },
  xAxisLabel: {
    color: 'gray',
    marginLeft: 25,
  },
  yAxisLabel: {
    color: 'gray',
  },
});

export default StoreSales;
