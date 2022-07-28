import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {isNull} from 'lodash';

import {PHILIPPINES_REGION} from '../../../utils/constant';

interface IMap {
  coordinate?: any;
  setCoordinate?: () => void;
}

const Map = ({coordinate, setCoordinate}: IMap) => {
  const mapRef = useRef(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const coord = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        mapRef.current.animateToRegion({
          ...coord,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
        setCoordinate(coord);
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }, []);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={PHILIPPINES_REGION}
      zoomControlEnabled
      mapType="hybrid">
      {!isNull(coordinate) && (
        <Marker
          draggable
          coordinate={coordinate}
          title="Current Location"
          onDragEnd={e => setCoordinate(e.nativeEvent.coordinate)}
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default Map;
