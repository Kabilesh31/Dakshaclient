import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const CustomerLiveMap = ({ location }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return <p>Loading map...</p>;

  if (!location) {
    return <p className="text-muted">No live location available</p>;
  }

  return (
    <GoogleMap
  mapContainerStyle={containerStyle}
  center={{ lat: location.lat, lng: location.lng }}
  zoom={16}
>
  <Marker position={{ lat: location.lat, lng: location.lng }} />
</GoogleMap>

  );
};

export default CustomerLiveMap;
