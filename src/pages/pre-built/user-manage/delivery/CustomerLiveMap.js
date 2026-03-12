import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const fallbackCenter = { lat: 11.0168, lng: 76.9558 };

const CustomerLiveMap = ({ staff, customers = [], selectedCustomer, travelMode = "DRIVING" }) => {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const [routePath, setRoutePath] = useState([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [hoveredCustomer, setHoveredCustomer] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(true); // Auto-open for selected customer

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
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
      (c) => c.geoLocation && !isNaN(Number(c.geoLocation.lat)) && !isNaN(Number(c.geoLocation.long)),
    );
  }, [customers]);

  /* ================= SORT BY LINE NO ================= */
  const sortedCustomers = useMemo(() => {
    return [...assignedCustomers].sort((a, b) => a.lineNo - b.lineNo);
  }, [assignedCustomers]);

  /* ================= SELECTED CUSTOMER POSITION ================= */
  const selectedCustomerPosition = useMemo(() => {
    if (!selectedCustomer?.geoLocation) return null;
    return {
      lat: Number(selectedCustomer.geoLocation.lat),
      lng: Number(selectedCustomer.geoLocation.long),
    };
  }, [selectedCustomer]);

  /* ================= MAP CENTER ================= */

  useEffect(() => {
    // When staff changes (refresh / new tracking)
    // reset customer selection
    if (staff) {
      setInfoWindowOpen(false);
    }
  }, [staff]);
  /* ================= AUTO FOCUS ON SELECTED CUSTOMER ================= */
  useEffect(() => {
    if (selectedCustomerPosition && mapRef.current) {
      // Pan to selected customer and zoom in
      mapRef.current.panTo(selectedCustomerPosition);
      mapRef.current.setZoom(16);

      // Auto-open info window for selected customer
      setInfoWindowOpen(true);

      // Add a highlight pulse effect
      if (window.google) {
        const pulseMarker = new window.google.maps.Marker({
          position: selectedCustomerPosition,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#1e88e5",
            fillOpacity: 0.2,
            strokeColor: "#1e88e5",
            strokeWeight: 2,
            scale: 30,
          },
          map: mapRef.current,
        });

        // Remove pulse marker after 3 seconds
        setTimeout(() => {
          pulseMarker.setMap(null);
        }, 3000);
      }
    }
  }, [selectedCustomerPosition]);

  /* ================= CALCULATE ROUTE ================= */
  const calculateRoute = useCallback(() => {
    if (!window.google || sortedCustomers.length < 2) {
      alert("Need at least 2 customers to show route");
      return;
    }

    setIsCalculatingRoute(true);

    try {
      const directionsService = new window.google.maps.DirectionsService();

      const origin = {
        lat: Number(sortedCustomers[0].geoLocation.lat),
        lng: Number(sortedCustomers[0].geoLocation.long),
      };

      const destination = {
        lat: Number(sortedCustomers[sortedCustomers.length - 1].geoLocation.lat),
        lng: Number(sortedCustomers[sortedCustomers.length - 1].geoLocation.long),
      };

      const waypoints = sortedCustomers.slice(1, -1).map((customer) => ({
        location: {
          lat: Number(customer.geoLocation.lat),
          lng: Number(customer.geoLocation.long),
        },
        stopover: true,
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode[travelMode] || window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (result, status) => {
          setIsCalculatingRoute(false);
          if (status === "OK") {
            const path = [];
            result.routes[0].legs.forEach((leg) => {
              leg.steps.forEach((step) => {
                path.push(...step.path);
              });
            });
            setRoutePath(path);

            if (mapRef.current) {
              const bounds = new window.google.maps.LatLngBounds();
              path.forEach((point) => bounds.extend(point));
              mapRef.current.fitBounds(bounds);
            }
          } else {
            console.error("Route calculation failed:", status);
          }
        },
      );
    } catch (error) {
      setIsCalculatingRoute(false);
      console.error("Route calculation error:", error);
      alert("Error calculating route. Check console for details.");
    }
  }, [sortedCustomers, travelMode]);
  const center = useMemo(() => {
    // Initially always staff
    if (staffPosition) return staffPosition;

    // Fallback (rare case)
    return fallbackCenter;
  }, [staffPosition]);
  /* ================= CREATE/DESTROY POLYLINE ================= */
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (routePath.length > 0) {
      polylineRef.current = new window.google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: "#1e88e5",
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: mapRef.current,
        zIndex: 1,
      });
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [routePath]);

  /* ================= CALCULATE ROUTE FROM STAFF ================= */
  const calculateRouteFromStaff = useCallback(() => {
    if (!window.google || !staffPosition || sortedCustomers.length === 0) {
      alert("Staff position or customers not available");
      return;
    }

    setIsCalculatingRoute(true);

    try {
      const directionsService = new window.google.maps.DirectionsService();

      const destination = {
        lat: Number(sortedCustomers[0].geoLocation.lat),
        lng: Number(sortedCustomers[0].geoLocation.long),
      };

      directionsService.route(
        {
          origin: staffPosition,
          destination,
          travelMode: window.google.maps.TravelMode[travelMode] || window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          setIsCalculatingRoute(false);
          if (status === "OK") {
            const path = [];
            result.routes[0].legs.forEach((leg) => {
              leg.steps.forEach((step) => {
                path.push(...step.path);
              });
            });
            setRoutePath(path);

            if (mapRef.current) {
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend(staffPosition);
              bounds.extend(destination);
              mapRef.current.fitBounds(bounds);
            }
          } else {
            console.error("Staff route failed:", status);
            alert(`Staff route failed: ${status}`);
          }
        },
      );
    } catch (error) {
      setIsCalculatingRoute(false);
      console.error("Staff route error:", error);
    }
  }, [staffPosition, sortedCustomers, travelMode]);

  /* ================= CLEAR ROUTE ================= */
  const clearRoute = useCallback(() => {
    setRoutePath([]);
  }, []);

  /* ================= FIT MAP TO ALL LOCATIONS ================= */
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current || (sortedCustomers.length === 0 && !staffPosition)) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (staffPosition) {
      bounds.extend(staffPosition);
    }

    sortedCustomers.forEach((customer) => {
      if (customer.geoLocation) {
        bounds.extend({
          lat: Number(customer.geoLocation.lat),
          lng: Number(customer.geoLocation.long),
        });
      }
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setZoom(mapRef.current.getZoom() - 1);
        }
      }, 100);
    }
  }, [sortedCustomers, staffPosition]);
  useEffect(() => {
    if (selectedCustomer && sortedCustomers.length >= 2) {
      // Calculate route between customers when a customer is selected
      calculateRoute();
    }
  }, [selectedCustomer, sortedCustomers, calculateRoute]);
  /* ================= AUTO CALCULATE ROUTE ================= */
  // useEffect(() => {
  //   if (
  //     isLoaded &&
  //     sortedCustomers.length >= 2 &&
  //     !selectedCustomer
  //   ) {
  //     setTimeout(calculateRoute, 1000);
  //   }
  // }, [isLoaded, sortedCustomers.length, calculateRoute, selectedCustomer]);

  /* ================= AUTO FIT MAP ON LOAD ================= */
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // If customer selected → focus customer
    if (selectedCustomerPosition) {
      mapRef.current.panTo(selectedCustomerPosition);
      mapRef.current.setZoom(16);
    }
    // Otherwise → always focus staff
    else if (staffPosition) {
      mapRef.current.panTo(staffPosition);
      mapRef.current.setZoom(14);
    }
  }, [isLoaded, selectedCustomerPosition, staffPosition]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div style={{ position: "relative" }}>
      {/* Navigation Controls */}
      <div
        style={{
          position: "absolute",
          top: "57px",
          left: "10px",
          right: "10px",
          display: "flex",
          gap: "8px",
          zIndex: 10,
        }}
      >
        <button
          onClick={fitMapToBounds}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "6px 6px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          title="Show all locations"
        >
          Fit View
        </button>

        {sortedCustomers.length >= 2 && (
          <button
            onClick={calculateRoute}
            disabled={isCalculatingRoute}
            style={{
              background: routePath.length > 0 ? "#f44336" : "#2196F3",
              color: "white",
              border: "none",
              padding: "6px 6px",
              borderRadius: "4px",
              cursor: isCalculatingRoute ? "not-allowed" : "pointer",
              fontSize: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              opacity: isCalculatingRoute ? 0.7 : 1,
            }}
            title="Show route between customers"
          >
            {isCalculatingRoute ? "Calculating..." : "Show Route"}
          </button>
        )}

        {staffPosition && sortedCustomers.length > 0 && (
          <button
            onClick={calculateRouteFromStaff}
            disabled={isCalculatingRoute}
            style={{
              background: "#9C27B0",
              color: "white",
              border: "none",
              padding: "6px 6px",
              borderRadius: "4px",
              cursor: isCalculatingRoute ? "not-allowed" : "pointer",
              fontSize: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              opacity: isCalculatingRoute ? 0.7 : 1,
            }}
            title="Show route from staff"
          >
            Staff Route
          </button>
        )}

        {routePath.length > 0 && (
          <button
            onClick={clearRoute}
            style={{
              background: "#FF9800",
              color: "white",
              border: "none",
              padding: "6px 6px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
            title="Clear route"
          >
            Clear
          </button>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={selectedCustomerPosition ? 16 : 13}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          maxZoom: 18,
          minZoom: 8,
        }}
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
            zIndex={1000}
          />
        )}

        {/* ================= CUSTOMER MARKERS ================= */}
        {sortedCustomers.map((customer, index) => {
          const isSelected = selectedCustomer?._id === customer._id;
          const isFirst = index === 0;
          const isLast = index === sortedCustomers.length - 1;
          const position = {
            lat: Number(customer.geoLocation.lat),
            lng: Number(customer.geoLocation.long),
          };

          // Determine marker icon
          let iconUrl = "/icons/store.png";
          let iconSize = 36;

          if (isSelected) {
            iconUrl = "/icons/store-selected.png";
            iconSize = 52; // Much larger for selected
          } else if (isFirst) {
            iconUrl = "/icons/start.png";
            iconSize = 40;
          } else if (isLast) {
            iconUrl = "/icons/end.png";
            iconSize = 40;
          }

          return (
            <React.Fragment key={customer._id}>
              <Marker
                position={position}
                title={`${customer.name || "Customer"} • Line: ${customer.lineNo}`}
                icon={{
                  url: iconUrl,
                  scaledSize: new window.google.maps.Size(iconSize, iconSize),
                }}
                zIndex={isSelected ? 2000 : 500 + index}
                onMouseOver={() => setHoveredCustomer(customer)}
                onMouseOut={() => setHoveredCustomer(null)}
              />

              {/* Selected Customer InfoWindow - Auto Opens */}
              {/* {isSelected && infoWindowOpen && (
                <InfoWindow
                  position={position}
                  onCloseClick={() => setInfoWindowOpen(false)}
                >
                  <div style={{ padding: "10px", maxWidth: "250px" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      marginBottom: "8px",
                      borderBottom: "2px solid #1e88e5",
                      paddingBottom: "6px"
                    }}>
                      <div style={{
                        background: "#1e88e5",
                        color: "white",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginRight: "10px",
                      }}>
                        {customer.lineNo}
                      </div>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "15px", color: "#1e88e5" }}>
                          {customer.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          🎯 SELECTED
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                      {customer.address && (
                        <div style={{ marginBottom: "4px" }}>
                          <strong>📍 Address:</strong> {customer.address}
                        </div>
                      )}
                      {customer.phone && (
                        <div style={{ marginBottom: "4px" }}>
                          <strong>📞 Phone:</strong> {customer.phone}
                        </div>
                      )}
                      <div style={{ 
                        marginTop: "6px", 
                        padding: "4px", 
                        background: "#f0f7ff", 
                        borderRadius: "4px",
                        fontSize: "11px",
                        color: "#1e88e5"
                      }}>
                        Coordinates: {Number(customer.geoLocation.lat).toFixed(6)}, {Number(customer.geoLocation.long).toFixed(6)}
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )} */}

              {/* Line Number Label */}
              {window.google && (
                <Marker
                  position={position}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: isSelected ? "#1e88e5" : isFirst ? "#4CAF50" : isLast ? "#f44336" : "#FF9800",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "white",
                    scale: isSelected ? 12 : 10, // Larger for selected
                  }}
                  label={{
                    text: `${customer.lineNo}`,
                    color: "white",
                    fontSize: isSelected ? "12px" : "10px",
                    fontWeight: "bold",
                  }}
                  zIndex={isSelected ? 2001 : 501 + index}
                />
              )}

              {/* Selected Customer Highlight Ring */}
              {isSelected && window.google && (
                <Marker
                  position={position}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: "transparent",
                    fillOpacity: 0,
                    strokeColor: "#1e88e5",
                    strokeWeight: 3,
                    strokeOpacity: 0.6,
                    scale: 35, // Large ring around selected marker
                  }}
                  zIndex={1999}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Hover Tooltip */}
        {hoveredCustomer && hoveredCustomer._id !== selectedCustomer?._id && (
          <InfoWindow
            position={{
              lat: Number(hoveredCustomer.geoLocation.lat),
              lng: Number(hoveredCustomer.geoLocation.long),
            }}
            onCloseClick={() => setHoveredCustomer(null)}
          >
            <div style={{ padding: "8px", maxWidth: "200px" }}>
              <div style={{ fontWeight: "bold", fontSize: "13px" }}>{hoveredCustomer.name}</div>
              <div style={{ fontSize: "12px", margin: "4px 0" }}>
                Line: <strong>{hoveredCustomer.lineNo}</strong>
              </div>
              <div style={{ fontSize: "11px", color: "#666" }}>Click on map to select</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Selected Customer Card (always visible) */}
      {selectedCustomer && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            background: "white",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10,
            maxWidth: "320px",
            // borderLeft: "5px solid #1e88e5",
            animation: "slideUp 0.3s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px" }}>
            <div
              style={{
                background: "#1e88e5",
                color: "white",
                minWidth: "32px",
                height: "32px",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                marginRight: "12px",
                flexShrink: 0,
              }}
            >
              {selectedCustomer.lineNo}
            </div>
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#1e88e5",
                  marginBottom: "2px",
                }}
              >
                {selectedCustomer.name}
              </div>
              {/* <div style={{ 
                fontSize: "12px", 
                background: "#e3f2fd", 
                padding: "2px 8px", 
                borderRadius: "10px",
                display: "inline-block"
              }}>
                🎯 Currently Selected
              </div> */}
            </div>
          </div>

          <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.5" }}>
            {selectedCustomer.address && (
              <div style={{ marginBottom: "6px" }}>
                <strong style={{ color: "#666" }}>📍</strong> {selectedCustomer.address}
              </div>
            )}
            {selectedCustomer.phone && (
              <div style={{ marginBottom: "6px" }}>
                <strong style={{ color: "#666" }}>📞</strong> {selectedCustomer.phone}
              </div>
            )}
            {/* <div style={{ 
              fontSize: "11px", 
              color: "#888", 
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid #eee"
            }}>
              Coordinates: {Number(selectedCustomer.geoLocation?.lat || 0).toFixed(6)}, {Number(selectedCustomer.geoLocation?.long || 0).toFixed(6)}
            </div> */}
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              onClick={() => {
                if (mapRef.current && selectedCustomerPosition) {
                  mapRef.current.panTo(selectedCustomerPosition);
                  mapRef.current.setZoom(16);
                  setInfoWindowOpen(true);
                }
              }}
              style={{
                flex: 1,
                background: "#1e88e5",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontWeight: "500",
              }}
            >
              <span>📍</span> Focus on Map
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .selected-marker {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default CustomerLiveMap;
