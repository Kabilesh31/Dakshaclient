import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import React, { useMemo } from "react";

const containerStyle = { width: "100%", height: "400px" };

const CustomerLiveMap = ({ staff, customers = [] }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const staffPosition = useMemo(() => {
    if (!staff?.location?.lat || !staff?.location?.lng) return null;
    return { lat: Number(staff.location.lat), lng: Number(staff.location.lng) };
  }, [staff]);

  const assignedCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.geoLocation &&
        !isNaN(Number(c.geoLocation.lat)) &&
        !isNaN(Number(c.geoLocation.long))
    );
  }, [customers]);

  const center = staffPosition || (assignedCustomers[0] && {
    lat: Number(assignedCustomers[0].geoLocation.lat),
    lng: Number(assignedCustomers[0].geoLocation.long),
  }) || { lat: 11.0168, lng: 76.9558 }; // fallback

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      {staffPosition && (
        <Marker
          position={staffPosition}
          title={`${staff.name || "Staff"} • Live`}
          icon={{
            url: "/icons/bike.png",
            scaledSize: new window.google.maps.Size(50, 50),
          }}
        />
      )}

      {assignedCustomers.map((customer) => (
        <Marker
          key={customer._id}
          position={{
            lat: Number(customer.geoLocation.lat),
            lng: Number(customer.geoLocation.long),
          }}
          title={customer.name}
          icon={{
            url: "/icons/store.png",
            scaledSize: new window.google.maps.Size(35, 35),
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default CustomerLiveMap;
