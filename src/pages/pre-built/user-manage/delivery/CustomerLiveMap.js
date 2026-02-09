import React, { useMemo, useEffect, useRef } from "react";
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

const CustomerLiveMap = ({
  staff,
  customers = [],
  selectedCustomer,
}) => {
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  /* ================= STAFF POSITION ================= */
  const staffPosition = useMemo(() => {
    if (!staff?.location?.lat || !staff?.location?.lng) return null;
    return {
      lat: Number(staff.location.lat),
      lng: Number(staff.location.lng),
    };
  }, [staff]);

  /* ================= VALID CUSTOMERS ================= */
  const assignedCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.geoLocation &&
        !isNaN(Number(c.geoLocation.lat)) &&
        !isNaN(Number(c.geoLocation.long))
    );
  }, [customers]);

  /* ================= MAP CENTER ================= */
  const center =
    selectedCustomer?.geoLocation
      ? {
          lat: Number(selectedCustomer.geoLocation.lat),
          lng: Number(selectedCustomer.geoLocation.long),
        }
      : staffPosition ||
        (assignedCustomers[0] && {
          lat: Number(assignedCustomers[0].geoLocation.lat),
          lng: Number(assignedCustomers[0].geoLocation.long),
        }) ||
        fallbackCenter;

  /* ================= AUTO FOCUS ON CUSTOMER ================= */
  useEffect(() => {
    if (
      selectedCustomer?.geoLocation?.lat &&
      selectedCustomer?.geoLocation?.long &&
      mapRef.current
    ) {
      mapRef.current.panTo({
        lat: Number(selectedCustomer.geoLocation.lat),
        lng: Number(selectedCustomer.geoLocation.long),
      });
      mapRef.current.setZoom(16);
    }
  }, [selectedCustomer]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={(map) => (mapRef.current = map)}
    >
      {/* ================= STAFF MARKER ================= */}
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

      {/* ================= CUSTOMER MARKERS ================= */}
      {assignedCustomers.map((customer) => {
        const isSelected = selectedCustomer?._id === customer._id;

        return (
          <OverlayView
            key={customer._id}
            position={{
              lat: Number(customer.geoLocation.lat),
              lng: Number(customer.geoLocation.long),
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                position: "relative",
                transform: "translate(-50%, -100%)",
              }}
            >
              {/* ===== LINE NO + NAME ===== */}
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  left: "60%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                {/* LINE NO CIRCLE */}
                <div
                  style={{
                    background: isSelected ? "#1e88e5" : "#e53935",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: isSelected ? "scale(1.2)" : "scale(1)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  {customer.lineNo}
                </div>

                {/* CUSTOMER NAME */}
                <div
                  style={{
                    marginTop: "2px",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    borderRadius: "4px",
                    padding: "2px 4px",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {customer.name}
                </div>
              </div>

              {/* ===== SHOP ICON ===== */}
              <img
                src="/icons/store.png"
                alt="Shop"
                style={{
                  width: isSelected ? "42px" : "36px",
                  height: isSelected ? "42px" : "36px",
                }}
              />
            </div>
          </OverlayView>
        );
      })}
    </GoogleMap>
  );
};

export default CustomerLiveMap;
