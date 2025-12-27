import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData, MapProps } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

const uberMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f2f2f2" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f2f2f2" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e5e7eb" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#dbeafe" }],
  },
];

const Map = ({ mode = "client", onMapPress }: MapProps) => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();
  const mapRef = useRef<MapView>(null);

  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const driverMarker = useMemo(() => {
    if (mode !== "driver") return null;
    if (!markers.length) return null;
    return (
      markers.find((marker) => marker.id === selectedDriver) ?? markers[0]
    );
  }, [markers, mode, selectedDriver]);

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [
    markers,
    destinationLatitude,
    destinationLongitude,
    setDrivers,
    userLatitude,
    userLongitude,
  ]);

  const region = useMemo(
    () =>
      calculateRegion({
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }),
    [userLatitude, userLongitude, destinationLatitude, destinationLongitude],
  );

  useEffect(() => {
    if (!mapRef.current || !userLatitude || !userLongitude) return;
    mapRef.current.animateToRegion(region, 400);
  }, [region, userLatitude, userLongitude]);

  const handleMapPress = (event: MapPressEvent) => {
    if (!onMapPress) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onMapPress({ latitude, longitude });
  };

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="standard"
      showsPointsOfInterest={false}
      showsBuildings={false}
      showsCompass={false}
      initialRegion={region}
      onPress={onMapPress ? handleMapPress : undefined}
      showsUserLocation={false}
      userInterfaceStyle="light"
      customMapStyle={uberMapStyle}
    >
      {userLatitude && userLongitude && (
        <Marker
          key="user-location"
          coordinate={{ latitude: userLatitude, longitude: userLongitude }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={{
              width: 14,
              height: 14,
              backgroundColor: "#ffffff",
              borderColor: "#111827",
              borderWidth: 2,
              borderRadius: 4,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            <View
              style={{
                width: 4,
                height: 4,
                backgroundColor: "#111827",
                borderRadius: 2,
              }}
            />
          </View>
        </Marker>
      )}
      {mode === "client" &&
        markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            image={
              selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
            }
          />
        ))}

      {mode === "driver" && driverMarker && (
        <Marker
          key="driver"
          coordinate={{
            latitude: driverMarker.latitude,
            longitude: driverMarker.longitude,
          }}
          title="Conductor"
          image={icons.selectedMarker}
        />
      )}

      {mode === "driver" && userLatitude && userLongitude && (
        <Marker
          key="pickup"
          coordinate={{
            latitude: userLatitude,
            longitude: userLongitude,
          }}
          title="Recogida"
          image={icons.pin}
        />
      )}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destino"
            image={icons.pin}
          />
          {mode === "client" && (
            <>
              <MapViewDirections
                origin={{
                  latitude: userLatitude!,
                  longitude: userLongitude!,
                }}
                destination={{
                  latitude: destinationLatitude,
                  longitude: destinationLongitude,
                }}
                apikey={directionsAPI!}
                strokeColor="#d1d5db"
                strokeWidth={6}
              />
              <MapViewDirections
                origin={{
                  latitude: userLatitude!,
                  longitude: userLongitude!,
                }}
                destination={{
                  latitude: destinationLatitude,
                  longitude: destinationLongitude,
                }}
                apikey={directionsAPI!}
                strokeColor="#111827"
                strokeWidth={3}
              />
            </>
          )}
        </>
      )}

      {mode === "driver" &&
        driverMarker &&
        userLatitude &&
        userLongitude && (
          <>
            <MapViewDirections
              origin={{
                latitude: driverMarker.latitude,
                longitude: driverMarker.longitude,
              }}
              destination={{
                latitude: userLatitude,
                longitude: userLongitude,
              }}
              apikey={directionsAPI!}
              strokeColor="#d1d5db"
              strokeWidth={6}
            />
            <MapViewDirections
              origin={{
                latitude: driverMarker.latitude,
                longitude: driverMarker.longitude,
              }}
              destination={{
                latitude: userLatitude,
                longitude: userLongitude,
              }}
              apikey={directionsAPI!}
              strokeColor="#111827"
              strokeWidth={3}
            />
          </>
        )}

      {mode === "driver" &&
        userLatitude &&
        userLongitude &&
        destinationLatitude &&
        destinationLongitude && (
          <>
            <MapViewDirections
              origin={{
                latitude: userLatitude,
                longitude: userLongitude,
              }}
              destination={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              apikey={directionsAPI!}
              strokeColor="#d1d5db"
              strokeWidth={6}
            />
            <MapViewDirections
              origin={{
                latitude: userLatitude,
                longitude: userLongitude,
              }}
              destination={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              apikey={directionsAPI!}
              strokeColor="#111827"
              strokeWidth={3}
            />
          </>
        )}
    </MapView>
  );
};

export default Map;
