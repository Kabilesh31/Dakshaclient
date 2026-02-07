import React, { useMemo } from "react";
import {
  GoogleMap,
  Marker,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const fallbackCenter = { lat: 11.0168, lng: 76.9558 };

const CustomerLiveMap = ({ staff, customers = [] }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const staffPosition = useMemo(() => {
    if (!staff?.location?.lat || !staff?.location?.lng) return null;
    return {
      lat: Number(staff.location.lat),
      lng: Number(staff.location.lng),
    };
  }, [staff]);

  const assignedCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.geoLocation &&
        !isNaN(Number(c.geoLocation.lat)) &&
        !isNaN(Number(c.geoLocation.long))
    );
  }, [customers]);

  const center =
    staffPosition ||
    (assignedCustomers[0] && {
      lat: Number(assignedCustomers[0].geoLocation.lat),
      lng: Number(assignedCustomers[0].geoLocation.long),
    }) ||
    fallbackCenter;

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      {/* Staff Marker */}
      {staffPosition && (
        <Marker
          position={staffPosition}
          title={`${staff?.name || "Staff"} • Live`}
          icon={{
            url: "/icons/bike.png",
            scaledSize: new window.google.maps.Size(50, 50),
          }}
        />
      )}

      {/* Customer Shop Markers */}
      {assignedCustomers.map((customer) => (
        <OverlayView
          key={customer._id}
          position={{
            lat: Number(customer.geoLocation.lat),
            lng: Number(customer.geoLocation.long),
          }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div style={{ position: "relative", transform: "translate(-50%, -100%)" }}>
            {/* Line No Badge */}
            <div
              style={{
                position: "absolute",
                top: "-18px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#e53935",
                color: "#fff",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                fontSize: "12px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              {customer.lineNo}
            </div>

            {/* Shop Icon */}
            <img
              src="/icons/shop.png"
              alt="Shop"
              style={{
                width: "36px",
                height: "36px",
              }}
            />
          </div>
        </OverlayView>
      ))}
    </GoogleMap>
  );
};

export default CustomerLiveMap;
