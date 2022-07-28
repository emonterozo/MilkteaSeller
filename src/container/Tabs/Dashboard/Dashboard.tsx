import React, {useContext, useEffect, useState} from 'react';
import {Box, Heading, HStack, Text, VStack} from 'native-base';
import {BarChart} from 'react-native-gifted-charts';
import {Dimensions, StyleSheet, View} from 'react-native';
import moment from 'moment';
import {orderBy} from 'lodash';

import {Header} from '../../../components';
import {getDashboardRequest} from '../../../services/request';
import GlobalContext from '../../../config/context';

const COLOR = {
  current: '#177AD5',
  previous: '#ED6665',
};

const Dashboard = () => {
  const {authenticatedUser} = useContext(GlobalContext);
  const [dashboard, setDashboard] = useState({
    store: 0,
    quantity: 0,
    revenue: 0,
  });
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const timestamp = {
    start: `${moment().year()}-01-01`,
    end: moment().format('YYYY-MM-DD'),
  };

  useEffect(() => {
    getDashboardRequest(
      authenticatedUser.user._id,
      timestamp.start,
      timestamp.end,
      authenticatedUser.token,
    )
      .then(res => {
        const {storeCount, stores, sales} = res;
        setDashboard({
          store: storeCount[0]?.count || 0,
          quantity: stores[0]?.quantity || 0,
          revenue: stores[0]?.revenue || 0,
        });

        const data = [];
        const previousYear = moment(timestamp.start).subtract(1, 'year').year();
        const currentYear = moment(timestamp.start).year();

        sales[previousYear].map((item, index) => {
          data.push({
            value: item.revenue,
            label: item.month,
            topLabelComponent: () =>
              topLabelComponent(formatRevenue(item.revenue)),
            spacing: 5,
            labelWidth: 70,
            labelTextStyle: {
              color: 'gray',
              textAlign: 'center',
            },
            frontColor: COLOR.previous,
            year: previousYear,
            order: index,
          });
        });
        sales[currentYear].map((item, index) => {
          data.push({
            value: item.revenue,
            topLabelComponent: () =>
              topLabelComponent(formatRevenue(item.revenue)),
            spacing: 30,
            frontColor: COLOR.current,
            year: currentYear,
            order: index,
          });
        });
        setGraphData(orderBy(data, 'order', 'asc'));
        setIsLoading(false);
      })
      .catch(err => console.log(err));
  }, []);

  const formatRevenue = (n: number) => {
    const ranges = [
      {divider: 1e18, suffix: 'E'},
      {divider: 1e15, suffix: 'P'},
      {divider: 1e12, suffix: 'T'},
      {divider: 1e9, suffix: 'G'},
      {divider: 1e6, suffix: 'M'},
      {divider: 1e3, suffix: 'k'},
    ];
    for (let i = 0; i < ranges.length; i++) {
      if (n >= ranges[i].divider) {
        return (n / ranges[i].divider).toString() + ranges[i].suffix;
      }
    }
    return n.toString();
  };

  const topLabelComponent = value => (
    <Text fontSize="xs" fontWeight="bold">
      {value}
    </Text>
  );

  return (
    <Box flex={1}>
      <Header title="Dashboard" isLogoutVisible />
      <Box flex={1}>
        <Text
          fontSize="sm"
          color="gray.500"
          alignSelf="flex-end"
          marginX={2}
          marginTop={2}>
          {`${moment(timestamp.start).format('MMM DD, YYYY')} - ${moment(
            timestamp.end,
          ).format('MMM DD, YYYY')}`}
        </Text>
        <HStack marginX={2} space={1} h="40%">
          <VStack w="45%" space={1}>
            <Box
              borderWidth="0"
              shadow="0"
              h="49%"
              alignItems="center"
              justifyContent="center">
              <Heading>{dashboard.store}</Heading>
              <Text fontSize="xs">Store Count</Text>
            </Box>
            <Box
              borderWidth="0"
              shadow="0"
              h="49%"
              alignItems="center"
              justifyContent="center">
              <Heading>{dashboard.quantity}</Heading>
              <Text fontSize="xs">Quantity</Text>
            </Box>
          </VStack>
          <Box
            flexGrow={1}
            borderWidth="0"
            shadow="0"
            alignItems="center"
            justifyContent="center">
            <Heading>{dashboard.revenue}</Heading>
            <Text fontSize="xs">Revenue</Text>
          </Box>
        </HStack>
        <Box m={2} h="60%">
          <Box alignItems="center">
            <Heading size="sm">Revenue Comparison</Heading>
            <HStack space={10} marginY={3}>
              <HStack alignItems="center" space={1}>
                <View style={[styles.dot, {backgroundColor: COLOR.previous}]} />
                <Text fontWeight="bold">
                  {moment(timestamp.start).subtract(1, 'year').year()}
                </Text>
              </HStack>
              <HStack alignItems="center" space={1}>
                <View style={[styles.dot, {backgroundColor: COLOR.current}]} />
                <Text fontWeight="bold">{moment(timestamp.start).year()}</Text>
              </HStack>
            </HStack>
          </Box>
          <BarChart
            data={graphData}
            width={Dimensions.get('window').width - 60}
            yAxisLabelSuffix=" php"
            yAxisLabelWidth={65}
            height={250}
            barWidth={30}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={styles.yAxis}
            noOfSections={7}
            minHeight={1}
          />
        </Box>
      </Box>
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
    borderColor: '#28ae60',
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  yAxis: {
    color: 'gray',
  },
});

export default Dashboard;
