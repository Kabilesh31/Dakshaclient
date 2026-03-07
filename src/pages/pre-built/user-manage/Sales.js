  import { Alert, Badge, DropdownItem, DropdownMenu, FormGroup, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
  import React, { useState, useEffect } from "react";
  import { successToast, errorToast, warningToast } from "../../../utils/toaster";
  import Content from "../../../layout/content/Content";
  import Head from "../../../layout/head/Head";
  import CustomerLiveMap from "./delivery/CustomerLiveMap";
  import { FiRefreshCw } from "react-icons/fi";
  import axios from "axios";
  import { 
    Block, 
    BlockHead, 
    BlockHeadContent, 
    BlockTitle, 
    BlockDes,
    Button,
    Icon,
    PreviewCard,
    PreviewAltCard,
  } from "../../../components/Component";
  import { useForm } from "react-hook-form";
  import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
  import "./Delivery.css";
import { FiClock } from 'react-icons/fi';
  const Sales = () => {
    const [activeTab, setActiveTab] = useState("alignment");
    const [vehicles, setVehicles] = useState([]);
    const [deliveryStaff, setDeliveryStaff] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [routeAssignments, setRouteAssignments] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [selectedTrackStaff, setSelectedTrackStaff] = useState(null);
    const [showAllStaff, setShowAllStaff] = useState(true);
    const [selectedRouteForAlignment, setSelectedRouteForAlignment] = useState("");
    const [customers, setCustomers] = useState([]);
     const getISTDate = () => {
     const date = new Date();
   
     const istDate = new Date(
       date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
     );
   console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
     const year = istDate.getFullYear();
     const month = String(istDate.getMonth() + 1).padStart(2, "0");
     const day = String(istDate.getDate()).padStart(2, "0");
   
     return `${year}-${month}-${day}`; // required format for input type=date
   };
   
   const [selectedDate, setSelectedDate] = useState(getISTDate());
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [viewCustomerModal, setViewCustomerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [liveLocation, setLiveLocation] = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [assinedCustomerDatas, setAssignedCustomerDatas] = useState([]);
    const [isSavingAlignment, setIsSavingAlignment] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [selectedCustomerForMap, setSelectedCustomerForMap] = useState(null);

  
    const fetchCustomersByAssignedStaff = async (id) => {
      try {

        const token = localStorage.getItem("accessToken");
        const sessionToken = localStorage.getItem("sessionToken");

        if (!token || !sessionToken) {
          console.log("User not authenticated");
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_BACKENDURL}/api/route-assignment-sales/${id}/assignedCustomer`,
          {
            params: { date: selectedDate },
            headers: {
              Authorization: `Bearer ${token}`,
              "session-token": sessionToken,
            },
          }
        );

        if (response.status === 200) {
          setAssignedCustomerDatas(response.data.customers);
        }

      } catch (err) {

        console.log("Fetch assigned customers error:", err);

        if (err.response) {

          if (err.response.status === 401) {

            console.log(
              err.response.data?.message || "Session expired. Please login again"
            );

            localStorage.removeItem("accessToken");
            localStorage.removeItem("sessionToken");

            window.location.href = "/login";

          }

        } else {
          console.log("Network error");
        }
      }
    };

    useEffect(() => {
      fetchStaff();
      fetchRoutes();
      fetchCustomers();
    }, []);
    useEffect(() => {
  fetchAssignmentsByDate(selectedDate);
  fetchAvailableVehicles(selectedDate);
}, [selectedDate]);

const fetchAvailableVehicles = async (date) => {
  try {

    const token = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!token || !sessionToken) {
      console.log("User not authenticated");
      return;
    }

    const res = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/vehicle/getAvailableVehicle`,
      {
        params: { date },
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    if (res.status === 200) {
      setVehicles(res.data.data || []);
    }

  } catch (error) {

    console.error("Vehicle fetch error:", error);

    if (error.response) {

      if (error.response.status === 401) {

        console.log(
          error.response.data?.message || "Session expired. Please login again"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");

        window.location.href = "/login";

      }

    }

    setVehicles([]);
  }
};
  


    useEffect(() => {
      if (!selectedTrackStaff) return;

   const fetchLocation = async () => {
  try {

    const token = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!token || !sessionToken) {
      console.log("User not authenticated");
      return;
    }

    const res = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/location/latest/${selectedTrackStaff._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    if (res.status === 200) {

      setLiveLocation({
        lat: res.data.latitude,
        lng: res.data.longitude,
        updatedAt: res.data.updatedAt,
        batteryLevel: res.data.batteryLevel,
        gpsStatus: res.data.gpsStatus,
        networkStatus: res.data.networkStatus,
        isOnline: res.data.isOnline,
      });

    }

  } catch (err) {

    console.error("Live tracking error:", err);

    if (err.response) {

      if (err.response.status === 401) {

        console.log(
          err.response.data?.message || "Session expired. Please login again"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");

        window.location.href = "/login";

      }

    }
  }
};


      fetchLocation();
      const interval = setInterval(fetchLocation, 20000);

      return () => clearInterval(interval);
    }, [selectedTrackStaff]);

    useEffect(() => {
      fetchAssignmentsByDate(selectedDate);
    }, [selectedDate]);


    // Helper function to safely find a route
    const findRoute = (routeId) => {
      if (!Array.isArray(routes)) return null;
      
      return routes.find(r => {
        const id = r._id || r.id;
        return String(id) === String(routeId);
      }) || null;
    };

    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        const sessionToken = localStorage.getItem("sessionToken");

        if (!token || !sessionToken) {
          console.log("User not authenticated");
          setDeliveryStaff([]);
          return;
        }

        const res = await axios.get(
          `${process.env.REACT_APP_BACKENDURL}/api/staff`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "session-token": sessionToken,
            },
          }
        );

        if (Array.isArray(res.data)) {

          const datas = res.data;

          const filteredStaffDatas = datas.filter(
            (item) => item.type === "sales"
          );

          setDeliveryStaff(filteredStaffDatas);

        } else {

          console.warn("Staff data is not in expected format:", res.data);
          setDeliveryStaff([]);

        }

      } catch (err) {

        console.error("STAFF FETCH ERROR 👉", err);

        if (err.response) {

          if (err.response.status === 401) {

            console.log(
              err.response.data?.message ||
              "Session expired. Please login again"
            );

            localStorage.removeItem("accessToken");
            localStorage.removeItem("sessionToken");

            window.location.href = "/login";

          } else {
            setError(err.response.data?.message || "Failed to load staff");
          }

        } else {
          setError("Network error");
        }

        setDeliveryStaff([]);

      } finally {
        setLoading(false);
      }
    };
    const fetchAssignmentsByDate = async (date) => {
  try {
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!token || !sessionToken) {
      console.log("User not authenticated");
      setRouteAssignments([]);
      return;
    }

    const res = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/route-assignment-sales`,
      {
        params: { date },
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    let assignmentsData = res.data;

    if (assignmentsData && Array.isArray(assignmentsData.data)) {
      setRouteAssignments(assignmentsData.data);
    } else if (Array.isArray(assignmentsData)) {
      setRouteAssignments(assignmentsData);
    } else {
      console.warn(
        "Assignments data is not in expected format:",
        assignmentsData
      );
      setRouteAssignments([]);
    }

  } catch (err) {

    console.error("Assignments fetch error:", err);

    if (err.response) {

      if (err.response.status === 401) {

        console.log(
          err.response.data?.message ||
          "Session expired. Please login again"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");

        window.location.href = "/login";

      } else {
        setError(err.response.data?.message || "Failed to load route assignments");
      }

    } else {
      setError("Network error");
    }

    setRouteAssignments([]);

  } finally {
    setLoading(false);
  }
};
  const fetchRoutes = async () => {
  try {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!token || !sessionToken) {
      console.log("User not authenticated");
      setRoutes([]);
      return;
    }

    const res = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/route`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    let routesData = res.data;

    // If response is { data: [] }
    if (routesData && routesData.data && Array.isArray(routesData.data)) {
      setRoutes(routesData.data);
    }
    // If response itself is []
    else if (Array.isArray(routesData)) {
      setRoutes(routesData);
    }
    // Unexpected format
    else {
      console.warn("Routes data is not in expected format:", routesData);
      setRoutes([]);
    }

  } catch (err) {

    console.error("ROUTES FETCH ERROR 👉", err);

    if (err.response) {

      if (err.response.status === 401) {

        console.log(
          err.response.data?.message ||
          "Session expired. Please login again"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");

        window.location.href = "/login";

      } else {
        setError(err.response.data?.message || "Failed to load routes");
      }

    } else {
      setError("Network error");
    }

    setRoutes([]);

  } finally {
    setLoading(false);
  }
};
  // After fetching customers
const fetchCustomers = async () => {
  try {

    const token = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!token || !sessionToken) {
      console.log("User not authenticated");
      setCustomers([]);
      return;
    }

    const res = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/customer`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    if (Array.isArray(res.data)) {
      setCustomers(res.data.filter((c) => !c.isDeleted && c.status));
    } else {
      console.warn("Customers data is not in expected format:", res.data);
      setCustomers([]);
    }

  } catch (err) {

    console.error("CUSTOMERS FETCH ERROR 👉", err);

    if (err.response) {

      if (err.response.status === 401) {

        console.log(
          err.response.data?.message ||
          "Session expired. Please login again"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");

        window.location.href = "/login";

      } else {
        errorToast(err.response.data?.message || "Failed to fetch customers");
      }

    } else {
      errorToast("Network error");
    }

    setCustomers([]);
  }
};


 const filteredDeliveryStaff = Array.isArray(deliveryStaff)
  ? deliveryStaff.filter(
      (staff) =>
        staff.staffStatus === "active" &&
        staff.isDeleted === false
    )
  : [];


    // Get routes already assigned to a specific staff member on selected date
    const getStaffAssignedRoutes = (staffId) => {
      if (!Array.isArray(routeAssignments)) return [];
      
      return routeAssignments.filter(
        assignment =>
          assignment.staffId?._id?.toString() === staffId?.toString() &&
          assignment.date === selectedDate
      );
    };

    // Get available routes (not assigned to anyone on selected date)
    const getAvailableRoutes = () => {
      // Ensure both are arrays
      if (!Array.isArray(routeAssignments) || !Array.isArray(routes)) {
        console.warn("routeAssignments or routes is not an array:", { 
          routeAssignments, 
          routes 
        });
        return [];
      }

      const assignedRouteIds = routeAssignments
        .filter(a => a && a.date === selectedDate)
        .map(a => {
          // Handle both string and object routeId
          if (typeof a.routeId === 'object' && a.routeId !== null) {
            return String(a.routeId._id || a.routeId.id);
          }
          return String(a.routeId);
        })
        .filter(id => id && id !== 'undefined');

      return routes.filter(r => {
        const routeId = String(r._id || r.id);
        return !assignedRouteIds.includes(routeId);
      });
    };

    // Check if staff can be assigned more routes (max 2)
    const canAssignMoreRoutes = (staffId) => {
      const staffAssignments = getStaffAssignedRoutes(staffId);
      return staffAssignments?.length < 2;
    };

    // Get status badge color
    const getStatusBadge = (status) => {
      switch(status) {
        case 'ASSIGNED': return 'warning';
        case 'IN_PROGRESS': return 'info';
        case 'COMPLETED': return 'success';
        default: return 'light';
      }
    };


    // Handle route assignment submission
    const onSubmitAssignment = async (data) => {
      try {
        setLoading(true);
        setError(null);

        const route = findRoute(data.routeId);

        if (!route) {
          setError('Selected route not found');
          return;
        }

        const isRouteAlreadyAssigned = routeAssignments.some(
          assignment => {
            const assignmentRouteId = typeof assignment.routeId === 'object' 
              ? (assignment.routeId._id || assignment.routeId.id)
              : assignment.routeId;
            return String(assignmentRouteId) === String(data.routeId) && assignment.date === selectedDate;
          }
        );

        if (isRouteAlreadyAssigned) {
          setError('This route is already assigned for the selected date');
          return;
        }

        const newAssignment = {
          _id: Date.now().toString(),
          date: selectedDate,
          staffId: selectedStaff._id,
          routeId: data.routeId,
          routeName: route.routeName || route.name,
          status: "ASSIGNED",
          createdAt: new Date().toISOString()
        };

        setRouteAssignments(prev => [...prev, newAssignment]);
        setSuccess(`Route "${route.routeName || route.name}" assigned to ${selectedStaff.name} successfully!`);
        setAssignModal(false);
        reset();
      } catch (err) {
        console.error(err);
        setError("Failed to assign route");
      } finally {
        setLoading(false);
      }
    };

   const handleUnassignRoute = async () => {
  if (!selectedAssignmentId) return;

  try {
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!token || !sessionToken) {
      console.log("User not authenticated");
      return;
    }

    await axios.delete(
      `${process.env.REACT_APP_BACKENDURL}/api/route-assignment-sales/${selectedAssignmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    // Remove from state
    setRouteAssignments((prev) =>
      Array.isArray(prev)
        ? prev.filter((a) => a._id !== selectedAssignmentId)
        : []
    );

    setSuccess("Route unassigned successfully");
    setTimeout(() => setSuccess(null), 3000);

    setConfirmOpen(false);
    setSelectedAssignmentId(null);

  } catch (err) {

    console.error("Unassign Error:", err.response?.data || err.message);

    if (err.response) {

      if (err.response.status === 401) {

        console.log(
          err.response.data?.message ||
          "Session expired. Please login again"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");

        window.location.href = "/login";

      } else {
        setError(err.response.data?.message || "Failed to unassign route");
      }

    } else {
      setError("Network error");
    }

    setTimeout(() => setError(null), 3000);

  } finally {
    setLoading(false);
  }
};

    const openUnassignConfirm = (assignmentId) => {
      setSelectedAssignmentId(assignmentId);
      setConfirmOpen(true);
    };

    // Format date for display
    const formatDisplayDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const routeCustomers = customers.filter(
      c => String(c.routeId) === String(selectedRouteForAlignment)
    );

    const otherCustomers = customers.filter(
      c => String(c.routeId) !== String(selectedRouteForAlignment)
    );

    const items = Array.from(routeCustomers);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const updated = items.map((c, index) => ({
      ...c,
      lineNo: index + 1,
    }));

    setCustomers([...otherCustomers, ...updated]);
  };

 const handleSaveAlignment = async () => {
  if (!selectedRouteForAlignment) {
    errorToast("Please select a route first");
    return;
  }

  try {
    setIsSavingAlignment(true);

    const token = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!token || !sessionToken) {
      console.log("User not authenticated");
      return;
    }

    const routeId = selectedRouteForAlignment;

    const customersToUpdate = customers
      .filter((c) => String(c.routeId) === String(routeId))
      .map((c, index) => ({
        _id: c._id,
        lineNo: index + 1,
      }));

    const res = await axios.put(
      `${process.env.REACT_APP_BACKENDURL}/api/delivery/update-line-order`,
      {
        routeId,
        customers: customersToUpdate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    if (res.data.status === "success") {
      successToast("Alignment saved successfully");
      fetchCustomers();
    } else {
      errorToast("Failed to save alignment");
    }

  } catch (err) {

    console.error("SAVE ALIGNMENT ERROR 👉", err.response?.data || err);

    if (err.response) {

      if (err.response.status === 401) {

        console.log(
          err.response.data?.message ||
          "Session expired. Please login again"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");

        window.location.href = "/login";

      } else {
        errorToast(err.response.data?.message || "Save failed");
      }

    } else {
      errorToast("Network error");
    }

  } finally {
    setIsSavingAlignment(false);
  }
};

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewCustomerModal(true);
  };

  const sortedCustomers = [...assinedCustomerDatas].sort(
    (a, b) => a.lineNo - b.lineNo
  );

  const firstPendingCustomer = sortedCustomers.find(
    (customer) => customer.isVisited === false
  );

  const currentLineNo = firstPendingCustomer
    ? firstPendingCustomer.lineNo
    : null;

    // Render Route Assign Tab
    const renderRouteAssign = () => {
      if (loading && routeAssignments.length === 0) {
        return <div className="text-center py-5">Loading...</div>;
      }

      if (!Array.isArray(routes)) {
        return (
          <Alert color="danger">
            Routes data is not in expected format. Please try refreshing the page.
          </Alert>
        );
      }

      const handlesRefresh = () => {
        fetchStaff();
      };
      const getAvailableVehiclesForStaff = (staffId) => {
  if (!Array.isArray(vehicles)) return [];

  const usedVehicles = routeAssignments
    .filter(a => a.date === selectedDate)
    .map(a => ({
      vehicleNo: a.vehicleNo,
      staffId: a.staffId?._id
    }));

  return vehicles.filter(vehicle => {
    const vehicleUsed = usedVehicles.find(
      v => v.vehicleNo === vehicle.vehicleNumber
    );

    if (!vehicleUsed) return true;

    if (vehicleUsed.staffId?.toString() === staffId?.toString())
      return true;

    return false;
  });
};
      return (
        <div className="row g-4">
          <div className="col-12">
            <PreviewCard>
              <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                <div>
                  <h5 className="title">Route Assignment</h5>
                  <p className="text-soft mb-0">Assign routes to delivery staff (max 2 routes per staff per day)</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  
                  <div style={{marginRight : "10px"}} >
                
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  {/* Refresh Button */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlesRefresh}
                  >
                   <FiRefreshCw size={18} />
                  </button>
                </div>
              </div>

              {/* Notifications */}
              {error && (
                <Alert color="danger" className="mb-3">
                  <Icon name="alert-circle"></Icon> {error}
                  <Button className="close" onClick={() => setError(null)}>
                    <Icon name="cross"></Icon>
                  </Button>
                </Alert>
              )}

              {success && (
                <Alert color="success" className="mb-3">
                  <Icon name="check-circle"></Icon> {success}
                  <Button className="close" onClick={() => setSuccess(null)}>
                    <Icon name="cross"></Icon>
                  </Button>
                </Alert>
              )}

              {/* Delivery Staff Table */}
              <div className="table-responsive" style={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
  <table className="table table-hover mb-0" style={{ minWidth: '1000px', fontSize: '0.85rem' }}>
    <thead style={{ backgroundColor: '#f8f9fc', borderBottom: '1px solid #e9ecef' }}>
      <tr>
        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#495057', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Staff Member</th>
        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#495057', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Assigned Routes</th>
        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#495057', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Status</th>
        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#495057', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {Array.isArray(filteredDeliveryStaff) && filteredDeliveryStaff.map((staff) => {
        const staffAssignments = getStaffAssignedRoutes(staff._id);
        const canAssign = canAssignMoreRoutes(staff._id);

        // Get already assigned vehicle for this staff on selected date
       // Get vehicle already assigned to this staff for selected date
const staffVehicleAssignment = routeAssignments.find(
  (a) =>
    a.staffId?._id?.toString() === staff._id?.toString() &&
    a.date === selectedDate
);

const existingVehicleNo = staffVehicleAssignment?.vehicleNo || null;
        
        return (
          <tr key={staff._id} style={{ borderBottom: '1px solid #edf2f7' }}>
            <td style={{ padding: '12px 16px' }}>
              <div className="d-flex align-items-center">
                <div style={{ marginRight: '12px', position: 'relative' }}>
                  <img
                    src={staff.img ? staff.img : "/images/placeholder.png"}
                    alt="profile"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#2c3e50', fontSize: '0.9rem' }}>{staff.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8a9cb0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    {staff.email}
                  </div>
                </div>
              </div>
            </td>
            
            <td style={{ padding: '12px 16px' }}>
              {staffAssignments?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {staffAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f8fafd',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #eef2f6'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '500', color: '#2c3e50', fontSize: '0.85rem' }}>
                          {assignment.routeId?.routeName || assignment.routeName}
                        </span>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: '500',
                          backgroundColor: assignment.status === 'ASSIGNED' ? '#e8f0fe' : '#fff4e5',
                          color: assignment.status === 'ASSIGNED' ? '#2c6b9e' : '#cc7b2e'
                        }}>
                          {assignment.status?.replace('_', ' ') || 'ASSIGNED'}
                        </span>
                        {assignment.vehicleNo && (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                              <circle cx="7" cy="16" r="2"></circle>
                              <circle cx="17" cy="16" r="2"></circle>
                            </svg>
                            {assignment.vehicleNo}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => openUnassignConfirm(assignment._id)}
                        style={{
                          border: 'none',
                          background: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          color: '#dc3545',
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#a0b3c9', fontSize: '0.85rem', fontStyle: 'italic' }}>No routes assigned</span>
              )}
            </td>

            <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: staffAssignments?.length === 0 ? '#f1f5f9' : '#e8f0fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  color: staffAssignments?.length === 0 ? '#8a9cb0' : '#2c6b9e',
                  fontSize: '0.85rem'
                }}>
                  {staffAssignments?.length || 0}
                </div>
                <span style={{ color: '#8a9cb0', fontSize: '0.8rem' }}>/2 Routes</span>
              </div>
            </td>

            <td style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                {/* Route Select */}
                <div style={{ position: 'relative', width: '120px' }}>
                  <select
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '8px 24px 8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e7ed',
                      backgroundColor: '#fff',
                      fontSize: '0.8rem',
                      color: '#2c3e50',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      height: '38px'
                    }}
                    value={staff.selectedRoute || ""}
                    onChange={(e) => {
                      setDeliveryStaff(prev =>
                        prev.map(s =>
                          s._id === staff._id
                            ? { ...s, selectedRoute: e.target.value }
                            : s
                        )
                      );
                    }}
                  >
                    <option value="">Route</option>
                    {Array.isArray(getAvailableRoutes()) &&
                      getAvailableRoutes().map(route => (
                        <option key={route._id} value={route._id}>
                          {route.routeName}
                        </option>
                      ))}
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#8a9cb0',
                    fontSize: '10px'
                  }}>
                    ▼
                  </div>
                </div>

                {/* Vehicle Select */}
                <div style={{ position: 'relative', width: '150px' }}>
                  <select
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '8px 24px 8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e7ed',
                      backgroundColor: existingVehicleNo ? '#f8fafd' : '#fff',
                      fontSize: '0.8rem',
                      color: existingVehicleNo ? '#8a9cb0' : '#2c3e50',
                      outline: 'none',
                      cursor: existingVehicleNo ? 'not-allowed' : 'pointer',
                      appearance: 'none',
                      height: '38px'
                    }}
                    disabled={!!existingVehicleNo}
                    value={
  existingVehicleNo ||
  staff.selectedVehicle ||
  ""
}
                    onChange={(e) => {
                      setDeliveryStaff(prev =>
                        prev.map(s =>
                          s._id === staff._id
                            ? { ...s, selectedVehicle: e.target.value }
                            : s
                        )
                      );
                    }}
                  >
                    <option value="">Vehicle</option>
                    {getAvailableVehiclesForStaff(staff._id).map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.vehicleNumber} ({vehicle.vehicleType})
                        </option>
                      ))}
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#8a9cb0',
                    fontSize: '10px'
                  }}>
                    ▼
                  </div>
                </div>

                {/* Assign Button */}
                <button
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: (!staff.selectedRoute || loading) ? '#f1f5f9' : '#2c6b9e',
                    color: (!staff.selectedRoute || loading) ? '#8a9cb0' : '#fff',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: (!staff.selectedRoute || loading) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    minWidth: '75px',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: (!staff.selectedRoute || loading) ? 'none' : '0 2px 4px rgba(44,107,158,0.2)'
                  }}
                  disabled={!staff.selectedRoute || loading}
                  onClick={async () => {
                      try {
                        setLoading(true);
                        setError(null);

                        const token = localStorage.getItem("accessToken");
                        const sessionToken = localStorage.getItem("sessionToken");

                        if (!token || !sessionToken) {
                          console.log("User not authenticated");
                          return;
                        }

                        const route = findRoute(staff.selectedRoute);
                        if (!route) {
                          setError("Selected route not found");
                          return;
                        }
                        const staffAssignments = getStaffAssignedRoutes(staff._id);

if (staffAssignments.length >= 2) {
  setError("This staff already has 2 routes assigned");
  return;
}

                      let vehicleToSend = null;

if (existingVehicleNo) {
  vehicleToSend = existingVehicleNo; // already vehicle number string
} else {
  const selectedVehicleData = vehicles.find(
    (v) => v._id === staff.selectedVehicle
  );
  vehicleToSend = selectedVehicleData?.vehicleNumber;
}

                        if (!vehicleToSend) {
                          setError("Please select vehicle");
                          return;
                        }
// Check if vehicle is used by another staff
const vehicleConflict = routeAssignments.find(
  a =>
    a.date === selectedDate &&
    a.vehicleNo === vehicleToSend &&
    a.staffId?._id?.toString() !== staff._id?.toString()
);

if (vehicleConflict) {
  setError("Vehicle already assigned to another staff");
  return;
}
                        await axios.post(
                          `${process.env.REACT_APP_BACKENDURL}/api/route-assignment-sales`,
                          {
                            date: selectedDate,
                            staffId: staff._id,
                            routeId: route._id,
                            routeName: route.routeName,
                            vehicleNo: vehicleToSend,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "session-token": sessionToken,
                            },
                          }
                        );

                        setSuccess(`Route "${route.routeName}" assigned to ${staff.name}`);
                        setTimeout(() => setSuccess(null), 3000);

                        fetchAssignmentsByDate(selectedDate);

                        // reset only route
                        setDeliveryStaff((prev) =>
                          prev.map((s) =>
                            s._id === staff._id ? { ...s, selectedRoute: "" } : s
                          )
                        );

                      } catch (err) {

                        console.error("Assign error:", err.response?.data || err);

                        if (err.response) {

                          if (err.response.status === 401) {

                            console.log(
                              err.response.data?.message ||
                              "Session expired. Please login again"
                            );

                            localStorage.removeItem("accessToken");
                            localStorage.removeItem("sessionToken");

                            window.location.href = "/login";

                          } else {
                            setError(err.response.data?.message || "Failed to assign route");
                          }

                        } else {
                          setError("Network error");
                        }

                      } finally {
                        setLoading(false);
                      }
                    }}
                  onMouseEnter={(e) => {
                    if (!(!staff.selectedRoute || loading)) {
                      e.currentTarget.style.backgroundColor = '#1e4f72';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(44,107,158,0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!staff.selectedRoute || loading)) {
                      e.currentTarget.style.backgroundColor = '#2c6b9e';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(44,107,158,0.2)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ 
                        width: '14px', 
                        height: '14px', 
                        border: '2px solid #fff', 
                        borderTopColor: 'transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 0.6s linear infinite',
                        display: 'inline-block'
                      }}></span>
                      <span>Assigning...</span>
                    </>
                  ) : (
                    'Assign'
                  )}
                </button>

              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

<style jsx>{`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .table-hover tbody tr:hover {
    background-color: #fafcff;
  }
  
  select:hover:not(:disabled) {
    border-color: #b8c5d4;
  }
`}</style>
            </PreviewCard>
          </div>

          {/* Available Routes & Statistics */}
          <div className="col-lg-12">
            <PreviewAltCard className="h-100">
              <h5 className="title">Assigned Routes for {formatDisplayDate(selectedDate)}</h5>
              <div className="mt-4">
                {Array.isArray(routeAssignments) && routeAssignments.length > 0 ? (
                  <div className="list-group">
                    {routeAssignments.map((assignment) => (
                      <div
                        key={assignment._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1">{assignment.routeId?.routeName || assignment.routeName}</h6>
                          <p className="mb-0 small text-primary">
                            Assigned to: {assignment.staffId?.name || assignment.staffId}
                          </p>
                          <p className="mb-0 small text-primary">
                            Assigned vehicle: {assignment.vehicleNo || "N/A"}
                          </p>
                        </div>

                        <Badge
                          color="danger"
                          pill
                          className="cursor-pointer ms-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => openUnassignConfirm(assignment._id)}
                        >
                          Unassign
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <Icon name="package" className="icon-xl text-light mb-3" />
                    <p className="text-muted">No routes are assigned to staff for this date</p>
                  </div>
                )}
              </div>
            </PreviewAltCard>
          </div>
        </div>
      );
    };

    // Render Customer Alignment Tab
  const renderCustomerAlignment = () => {
  const selectedRoute = routes.find(
    (route) => String(route._id) === String(selectedRouteForAlignment)
  );

  const routeCustomers = customers
    .filter(c => String(c.routeId) === String(selectedRouteForAlignment))
    .sort((a, b) => a.lineNo - b.lineNo);


      
      return (
        <div className="row g-4">
          <div className="col-12">
            <PreviewCard>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-5 ">
                <div>
                  <h5 className="title">Customer Shop Alignment</h5>
                  <p className="text-soft mb-0">Drag and drop to set delivery line order for customers</p>
                </div>
                <div className="d-flex gap-2">
                  <div className="form-group" style={{ minWidth: '220px' }}>
                    <label className="form-label ml-1">Select Route</label>
                  <select
                    className="form-control"
                    value={selectedRouteForAlignment}
                    style={{padding:"2px"}}
                    onChange={(e) => setSelectedRouteForAlignment(e.target.value)}
                  >
                    <option  value="">Select Route</option>
                    {routes.map(route => (
                      <option key={route._id} value={route._id}>
                    <span >{route.routeName}</span>
                  </option>
                    ))}
                  </select>

                  </div>
                  <Button 
                    color="primary" 
                    style={{padding:"20px", marginLeft: "10px"}}
                    size="md" 
                    onClick={handleSaveAlignment}
                    disabled={isSavingAlignment}
                    className="mt-4"
                  >
                    {isSavingAlignment ? "Saving..." : "Save Alignment"}
                  </Button>
                
                </div>
              </div>

              {success && (
                <Alert color="success" className="mb-3">
                  <Icon name="check-circle"></Icon> {success}
                  <Button className="close" onClick={() => setSuccess(null)}>
                    <Icon name="cross"></Icon>
                  </Button>
                </Alert>
              )}

              {error && (
                <Alert color="danger" className="mb-3">
                  <Icon name="alert-circle"></Icon> {error}
                  <Button className="close" onClick={() => setError(null)}>
                    <Icon name="cross"></Icon>
                  </Button>
                </Alert>
              )}

              <div className="row">
                <div className="col-lg-8">
                  <div className="card card-bordered">
                    <div className="card-inner">

                      <h6 className="title mb-3">
                        {selectedRoute
                          ? `${selectedRoute.routeName} - Delivery Line Order`
                          : "Select a Route"}
                        {selectedRoute && (
                          <Badge color="primary" className="ms-2">
                            {routeCustomers.length} Customers
                          </Badge>
                        )}
                      </h6>

                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="customers">
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.droppableProps}>

                                {routeCustomers.length > 0 ? (
                                  routeCustomers.map((customer, index) => (
                                    
                                    <Draggable
                                      key={customer._id}
                                      draggableId={customer._id}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="customer-item mb-2"
                                        >
                                          <div className="d-flex align-items-center">

                                            <Badge className="mx-2" color="primary" pill>
                                              {customer.lineNo}
                                            </Badge>
                                          <div className="ms-3 w-100">
                                            <div style={{display : "flex", justifyContent : "space-between"}} className="d-flex w-100 pr-2">
                                              <strong>{customer.name}</strong>

                                              {customer.isNew && (
                                                <strong style={{backgroundColor : "#f2f2f2", width : "45px", textAlign : "center", marginTop : "5px", fontSize : "12px"}} className="ms-auto text-danger">
                                                  New
                                                </strong>
                                              )}
                                            </div>

                                            <div className="text-muted small">
                                              {customer.address} | {customer.phone}
                                            </div>
                                          </div>

                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))
                                ) : (
                                  <p className="text-center text-muted">
                                    No customers assigned to this route
                                  </p>
                                )}

                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>

                      </div>
                    </div>
                  </div>


                <div className="col-lg-4">
                  <div className="card card-bordered h-100">
                    <div className="card-inner">
                      
                     
                        

                        <div className="mt-2">
                          <h6 className="title">Alignment Instructions</h6>
                          <ul className="list-unstyled">
                            <li className="mb-2">
                              <Icon name="check-circle" className="text-success"></Icon>
                              <span className="ms-2">Drag customers to set delivery order</span>
                            </li>
                            <li className="mb-2">
                              <Icon name="check-circle" className="text-success"></Icon>
                              <span className="ms-2">Line numbers update automatically</span>
                            </li>
                            <li className="mb-2">
                              <Icon name="check-circle" className="text-success"></Icon>
                              <span className="ms-2">Click Save Alignment to persist changes</span>
                            </li>
                            <li className="mb-2">
                              <Icon name="check-circle" className="text-success"></Icon>
                              <span className="ms-2">Add more customers from Add Customer button</span>
                            </li>
                          </ul>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              

              {/* Customer Details Table */}
              <div className="mt-4">
                <h6 className="title">Customer Details</h6>
                <div className="table-responsive">
                  <table className="table table-hover mt-2">
                    <thead>
                      <tr>
                        <th>Line No</th>
                        <th>Customer Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Category</th>
                        <th>Credit Days</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routeCustomers.map((customer) => (
                        <tr key={customer._id}>
                          <td>
                            <Badge color="primary">{customer.lineNo}</Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm bg-light">
                                <span>{customer.name.charAt(0)}</span>
                              </div>
                              <div className="ms-2">
                                <div className="fw-bold">{customer.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              {customer.address}
                            </div>
                          </td>
                          <td>{customer.phone}</td>
                          <td>
                            <Badge color="light">{customer.category}</Badge>
                          </td>
                          <td>
                            <Badge color={customer.creditDays > 30 ? "warning" : "success"}>
                              {customer.creditDays} days
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                  size="md"
                                  style={{height:"30px"}}
                                  color="light"
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  <Icon name="eye"></Icon>
                                </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </PreviewCard>
          </div>
        </div>
      );
    };
    // Render Live Track Tab
 // Render Live Track Tab
const renderLiveTrack = () => {
  if (!Array.isArray(routeAssignments) || !Array.isArray(filteredDeliveryStaff)) {
    return (
      <Alert color="danger">
        Data is not available. Please try refreshing the page.
      </Alert>
    );
  }

  // Get active deliveries (IN_PROGRESS) for selected date
  const activeDeliveries = routeAssignments
    .filter(a => a.date === selectedDate && a.status === 'IN_PROGRESS');
  
  // Get staff with active deliveries
  const staffWithActiveDeliveries = filteredDeliveryStaff.filter(staff => 
    activeDeliveries.some(delivery => 
    String(delivery.staffId?._id || delivery.staffId) === String(staff._id)
  ));

  const selectedStaffDelivery = selectedTrackStaff
    ? activeDeliveries.find(delivery =>
        String(delivery.staffId?._id || delivery.staffId) ===
        String(selectedTrackStaff._id)
      )
    : null;

  const totalCustomers = assinedCustomerDatas?.length || 0;
  const completedCustomers = assinedCustomerDatas?.filter((c) => c.isVisited === true).length || 0;
  const isRouteCompleted = totalCustomers > 0 && completedCustomers === totalCustomers;

  // Helper function to calculate time difference between visits
  const calculateTimeBetweenVisits = (currentCustomer, allCustomers) => {
    if (!currentCustomer.isVisited || !currentCustomer.visitedAt) return null;
    
    const sortedCustomers = [...allCustomers]
      .filter(c => c.isVisited && c.visitedAt)
      .sort((a, b) => new Date(a.visitedAt) - new Date(b.visitedAt));
    
    const currentIndex = sortedCustomers.findIndex(c => c._id === currentCustomer._id);
    if (currentIndex <= 0) return null; // First visited customer
    
    const prevCustomer = sortedCustomers[currentIndex - 1];
    const prevTime = new Date(prevCustomer.visitedAt).getTime();
    const currentTime = new Date(currentCustomer.visitedAt).getTime();
    const diffMinutes = Math.round((currentTime - prevTime) / (1000 * 60));
    
    return {
      minutes: diffMinutes,
      fromCustomer: prevCustomer.name,
      toCustomer: currentCustomer.name
    };
  };

  // Calculate warehouse to first customer time using selectedTrackStaff
  const calculateWarehouseToFirstCustomerTime = () => {
    // Check if we have selectedTrackStaff with startedAt
    if (!selectedTrackStaff?.startedAt) {
      console.log("No startedAt for selectedTrackStaff:", selectedTrackStaff);
      return null;
    }
    
    // Check if we have assigned customer data
    if (!assinedCustomerDatas || assinedCustomerDatas.length === 0) {
      console.log("No assigned customer data");
      return null;
    }
    
    // Get visited customers sorted by visit time
    const visitedCustomers = assinedCustomerDatas.filter(c => c.isVisited === true && c.visitedAt);
    if (visitedCustomers.length === 0) {
      console.log("No visited customers yet");
      return null;
    }
    
    // Sort by visitedAt time
    const sortedVisits = [...visitedCustomers].sort((a, b) => 
      new Date(a.visitedAt) - new Date(b.visitedAt)
    );
    
    const firstCustomer = sortedVisits[0];
    const startTime = new Date(selectedTrackStaff.startedAt).getTime();
    const firstVisitTime = new Date(firstCustomer.visitedAt).getTime();
    
    console.log("Calculating warehouse to first customer:", {
      staffName: selectedTrackStaff.name,
      startedAt: selectedTrackStaff.startedAt,
      firstCustomer: firstCustomer.name,
      firstVisitTime: firstCustomer.visitedAt,
      startTime,
      firstVisitTime
    });
    
    // If first visit happened before start time (shouldn't happen, but just in case)
    if (firstVisitTime < startTime) return null;
    
    const diffMinutes = Math.round((firstVisitTime - startTime) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return {
      minutes: diffMinutes,
      formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      startTime: selectedTrackStaff.startedAt,
      firstVisitTime: firstCustomer.visitedAt,
      firstCustomerName: firstCustomer.name
    };
  };

  // Calculate total route time between first and last visit
  const calculateTotalRouteTime = () => {
    if (!assinedCustomerDatas) return null;
    
    const visitedCustomers = assinedCustomerDatas.filter(c => c.isVisited && c.visitedAt);
    if (visitedCustomers.length < 2) return null;
    
    const sortedVisits = [...visitedCustomers].sort((a, b) => 
      new Date(a.visitedAt) - new Date(b.visitedAt)
    );
    
    const firstVisitTime = new Date(sortedVisits[0].visitedAt).getTime();
    const lastVisitTime = new Date(sortedVisits[sortedVisits.length - 1].visitedAt).getTime();
    const totalMinutes = Math.round((lastVisitTime - firstVisitTime) / (1000 * 60));
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return {
      totalMinutes,
      formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      firstCustomer: sortedVisits[0].name,
      lastCustomer: sortedVisits[sortedVisits.length - 1].name
    };
  };

  // Calculate total route duration from start to end (if endedAt exists)
  const calculateTotalRouteDuration = () => {
    if (!selectedTrackStaff?.startedAt) return null;
    
    const startTime = new Date(selectedTrackStaff.startedAt).getTime();
    
    // If staff has endedAt, use that
    if (selectedTrackStaff?.endedAt) {
      const endTime = new Date(selectedTrackStaff.endedAt).getTime();
      const diffMinutes = Math.round((endTime - startTime) / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      return {
        minutes: diffMinutes,
        formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        type: 'complete'
      };
    }
    
    // Otherwise use last visited customer if available
    const visitedCustomers = assinedCustomerDatas?.filter(c => c.isVisited && c.visitedAt) || [];
    if (visitedCustomers.length > 0) {
      const sortedVisits = [...visitedCustomers].sort((a, b) => 
        new Date(a.visitedAt) - new Date(b.visitedAt)
      );
      const lastVisitTime = new Date(sortedVisits[sortedVisits.length - 1].visitedAt).getTime();
      const diffMinutes = Math.round((lastVisitTime - startTime) / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      return {
        minutes: diffMinutes,
        formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        type: 'partial'
      };
    }
    
    return null;
  };

  // Calculate these values only when selectedTrackStaff exists
  const warehouseToFirstCustomer = selectedTrackStaff ? calculateWarehouseToFirstCustomerTime() : null;
  const routeTimeStats = calculateTotalRouteTime();
  const totalDuration = selectedTrackStaff ? calculateTotalRouteDuration() : null;

  const getCustomerStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "current":
        return "text-primary";
      case "upcoming":
        return "text-warning";
      default:
        return "text-muted";
    }
  };
  
  const getRailIcon = (status) => {
    if (status === "completed") {
      return <Icon name="check-circle-fill" className="text-success" />;
    }

    if (status === "current") {
      return <Icon name="truck" className="text-primary" />;
    }

    return <Icon name="clock" className="text-muted" />;
  };
  
  const formatVisitedTime = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleRefresh = () => {
    if (selectedStaffId) {
      fetchCustomersByAssignedStaff(selectedStaffId);
    }
    fetchCustomers();
    fetchStaff();
  };
  
  return (
    <div className="row g-4">
      <div className="col-12">
        <PreviewCard>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="title">Live Sales Tracking</h5>
              <p className="text-soft mb-0">
                Track Sales in real-time on the map
              </p>
            </div>

            <div className="d-flex gap-2 align-items-end">
              <div style={{marginRight : "10px"}} >
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-control"
                />
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRefresh}
              >
                <FiRefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="row g-1">
            {/* Left Side - Staff Selection */}
            <div className="col-lg-2">
              <div className="card card-bordered h-100">
                <div className="card-inner">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="title">Active Sales Staff</h6>
                  </div>
                  
                  <div className="mb-3">
                    <div className="input-group input-group-sm">
                      <Input
                        type="text"
                        placeholder="Search staff..."
                        className="form-control form-control-sm"
                      />
                    </div>
                  </div>

                  <div className="staff-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {(showAllStaff ? filteredDeliveryStaff : staffWithActiveDeliveries).map((staff) => {
                      const staffDelivery = activeDeliveries.find(d =>
                        String(d.staffId?._id || d.staffId) === String(staff._id)
                      );

                      const isSelected = selectedTrackStaff?._id === staff._id;
                      
                      return (
                        <div 
                          key={staff._id}
                          className={`staff-card mb-2 p-2 border rounded cursor-pointer ${isSelected ? 'selected-staff' : ''}`}
                          onClick={() => {
                            fetchCustomersByAssignedStaff(staff._id);
                            setSelectedTrackStaff(staff);                                
                            setSelectedStaffId(staff._id);
                          }}
                          style={{ 
                            cursor: 'pointer',
                            borderColor: isSelected ? '#6576ff' : '#e5e9f2',
                            backgroundColor: isSelected ? 'rgba(101, 118, 255, 0.04)' : '#fff'
                          }}
                        >
                          {/* Top Row */}
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-xxs mr-1 bg-primary me-2 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', borderRadius: '50%' }}>
                                <span>{staff.name?.charAt(0) || 'S'}</span>
                              </div>

                              <div className="lh-1">
                                <div className="fw-medium fs-13">{staff.name}</div>
                                <div className="text-muted fs-11">{staff.phone}</div>
                              </div>
                            </div>

                            {staffDelivery && (
                              <Badge
                                size="sm"
                                color={getStatusBadge(staffDelivery.status)}
                                className="fs-10"
                              >
                                {staffDelivery.status?.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>

                          {/* Route Info */}
                          {staffDelivery && (
                            <div className="mt-1">
                              <small className="text-muted fs-11">
                                Route:
                                <span className="fw-medium text-dark ms-1">
                                  {staffDelivery.routeName}
                                </span>
                              </small>
                              {staff.startedAt && (
                                <small className="text-muted fs-11 d-block">
                                  Started: {formatVisitedTime(staff.startedAt)}
                                </small>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {(!showAllStaff && staffWithActiveDeliveries.length === 0) && (
                      <div className="text-center py-5">
                        <Icon name="clock" className="icon-xl text-muted mb-3"></Icon>
                        <p className="text-muted">No active deliveries</p>
                        <Button 
                          color="primary" 
                          size="sm" 
                          onClick={() => setShowAllStaff(true)}
                        >
                          Show All Staff
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-bordered h-100">
                <div className="card-inner">
                  {/* HEADER */}
                  <div className="mb-3">
                    <h6 className="title">
                      {selectedTrackStaff ? (
                        <>
                          Tracking: {selectedTrackStaff.name}
                          <span className="text-muted ml-1 ms-2">
                            ({completedCustomers} / {totalCustomers})
                          </span>
                        </>
                      ) : (
                        "Live Map View (All Staff)"
                      )}

                      {selectedTrackStaff && selectedStaffDelivery && (
                        <Badge color="primary" className="ms-2">
                          {selectedStaffDelivery.routeName}
                        </Badge>
                      )}
                    </h6>

                    {selectedTrackStaff && liveLocation && (
                      <p className="text-muted mb-0 small">
                        Last updated:{" "}
                        {new Date(
                          liveLocation.updatedAt ||
                          liveLocation.timeStamp ||
                          Date.now()
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    )}
                    
                    {/* Debug info - remove in production */}
                    {selectedTrackStaff && (
                      <div className="small text-muted mt-1">
                        <div>Started: {selectedTrackStaff.startedAt ? formatVisitedTime(selectedTrackStaff.startedAt) : 'Not started'}</div>
                        {/* <div>First customer time: {warehouseToFirstCustomer ? warehouseToFirstCustomer.formatted : 'Not available'}</div> */}
                      </div>
                    )}
                  </div>

                  <CustomerLiveMap
                    staff={selectedTrackStaff ? { ...selectedTrackStaff, location: liveLocation } : null}
                    customers={assinedCustomerDatas}
                    selectedCustomer={selectedCustomerForMap}
                    travelMode="DRIVING"
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card card-bordered h-100">
                <div className="card-inner">
                  {/* HEADER */}
                  <div className="mb-3">
                    <div className="mb-1">
                      {/* FIRST LINE */}
                      <h6 className="title d-flex align-items-center mb-0">
                        <span
                          className="me-1"
                          style={{ fontSize: "27px", lineHeight: 1 }}
                        >
                          🏍️
                        </span>

                        Sales Vehicle{" "}
                        <Badge
                          color={isRouteCompleted ? "success" : "primary"}
                          className="fs-11 ms-2"
                        >
                          Status : {isRouteCompleted ? "Completed" : "Running"}
                        </Badge>
                      </h6>

                      {/* Time Statistics */}
                      {/* <div className="mt-2">
                        {warehouseToFirstCustomer && (
                          <div className="small text-primary mb-1">
                            <FiClock size={12} className="me-1" />
                            <span className="fw-medium">Warehouse to 1st:</span> {warehouseToFirstCustomer.formatted}
                          </div>
                        )}
                        
                        {routeTimeStats && (
                          <div className="small text-info mb-1">
                            <FiClock size={12} className="me-1" />
                            <span className="fw-medium">Time between visits:</span> {routeTimeStats.formatted}
                          </div>
                        )}

                        {totalDuration && (
                          <div className="small text-success mb-1">
                            <FiClock size={12} className="me-1" />
                            <span className="fw-medium">Total duration:</span> {totalDuration.formatted}
                          </div>
                        )}
                      </div> */}
                    </div>

                    <small className="text-muted d-block mt-2">
                      {selectedTrackStaff?.startedAt && (
                        <span className="me-3">
                          <span className="fw-medium">Started:</span> {formatVisitedTime(selectedTrackStaff.startedAt)}
                        </span>
                      )}
                      {selectedTrackStaff?.endedAt && (
                        <span className="me-3">
                          <span className="fw-medium">Ended:</span> {formatVisitedTime(selectedTrackStaff.endedAt)}
                        </span>
                      )}
                      {/* <span className="me-3">
                        <span className="fw-medium">Distance:</span> 65 km
                      </span> */}
                    </small>
                  </div>

                  {/* RAIL STATUS */}
                  {!assinedCustomerDatas || assinedCustomerDatas.length === 0 ? (
  <div className="text-center py-5">
    <div style={{ fontSize: "40px" }}>📍</div>
    <h6 className="mt-3 mb-1">No Routes Assigned</h6>
    <p className="text-muted mb-0">
      This staff has no routes assigned for today.
    </p>
  </div>
) : (
  <div className="rail-status">

    {/* START POINT - Warehouse */}
    <div className="rail-row completed">
      <div className="rail-left">
        <div className="rail-dot"></div>
        <div className="rail-line"></div>
      </div>
      <div className="rail-content">
        <div className="d-flex justify-content-between">
          <strong>Central Warehouse</strong>
          <span className="time">
            {selectedTrackStaff?.startedAt
              ? formatVisitedTime(selectedTrackStaff.startedAt)
              : "--:--"}
          </span>
        </div>
        <small className="text-muted">
          Trip Started • 0 km
          {warehouseToFirstCustomer && (
            <span className="text-primary ms-2">
              → 1st in {warehouseToFirstCustomer.formatted}
            </span>
          )}
        </small>
      </div>
    </div>

    {/* CUSTOMERS */}
    {assinedCustomerDatas
      .sort((a, b) => a.lineNo - b.lineNo)
      .map((customer, index) => {
        const isActiveCustomer =
          selectedCustomerForMap?._id === customer._id;

        let rowStatus = "upcoming";

        if (customer.isVisited === true) {
          rowStatus = "completed";
        } else if (customer.isVisited === false) {
          const hasPreviousPending = assinedCustomerDatas
            .sort((a, b) => a.lineNo - b.lineNo)
            .some(
              (c) =>
                c.lineNo < customer.lineNo &&
                c.isVisited === false
            );

          if (!hasPreviousPending) {
            rowStatus = "current";
          }
        }

        const timeBetweenVisits =
          rowStatus === "completed"
            ? calculateTimeBetweenVisits(
                customer,
                assinedCustomerDatas
              )
            : null;

        const isFirstCustomer =
          index === 0 &&
          rowStatus === "completed" &&
          warehouseToFirstCustomer;

        return (
          <div
            className={`rail-row ${rowStatus} ${
              isActiveCustomer ? "active-customer" : ""
            }`}
            key={customer._id}
            onClick={() =>
              setSelectedCustomerForMap(customer)
            }
          >
            <div className="rail-left">
              {rowStatus === "current" ? (
                <div className="rail-van">
                  <div className="rail-icon">
                    {getRailIcon(rowStatus)}
                  </div>
                </div>
              ) : (
                <div className="rail-dot"></div>
              )}

              {index !== assinedCustomerDatas.length - 1 && (
                <div className="rail-line"></div>
              )}
            </div>

            <div className="rail-content">
              <div className="d-flex justify-content-between">
                <div>
                  <strong>
                    {customer.name}

                    {isFirstCustomer && (
                      <Badge
                        color="primary"
                        className="ms-2"
                        pill
                      >
                        ⏱️ +{warehouseToFirstCustomer.formatted}
                      </Badge>
                    )}

                    {timeBetweenVisits &&
                      !isFirstCustomer && (
                        <Badge
                          color="info"
                          className="ms-2"
                          pill
                        >
                          ⏱️ +{timeBetweenVisits.minutes}m
                        </Badge>
                      )}
                  </strong>
                </div>

                <div className="text-end">
                  <span
                    className={`time ${getCustomerStatusClass(
                      rowStatus
                    )} d-block`}
                  >
                    {rowStatus === "completed" &&
                      "Visited"}
                    {rowStatus === "current" &&
                      "Arriving"}
                    {rowStatus === "upcoming" &&
                      "Expected"}
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-1">
                <small
                  className={
                    rowStatus === "current"
                      ? "text-primary"
                      : "text-muted"
                  }
                >
                  Line No: {customer.lineNo} •{" "}
                  {customer.routeName}
                </small>

                {rowStatus === "completed" &&
                  customer.visitedAt && (
                    <span className="text-muted small">
                      {formatVisitedTime(
                        customer.visitedAt
                      )}
                    </span>
                  )}
              </div>
            </div>
          </div>
        );
      })}

    {/* END POINT */}
    <div
      className={`rail-row ${
        isRouteCompleted ? "completed" : "upcoming"
      }`}
    >
      <div className="rail-left">
        <div className="rail-dot"></div>
      </div>
      <div className="rail-content">
        <div className="d-flex justify-content-between">
          <strong>Route End (Warehouse)</strong>
          <span className="time">
            {selectedTrackStaff?.endedAt
              ? formatVisitedTime(
                  selectedTrackStaff.endedAt
                )
              : "--:--"}
          </span>
        </div>
        <small className="text-muted">
          Trip Completion
          {totalDuration && (
            <span className="text-success ms-2">
              Total: {totalDuration.formatted}
            </span>
          )}
        </small>
      </div>
    </div>

    {isRouteCompleted && (
      <div className="alert alert-success py-2 mb-3">
        🎉 All Customers Visited – Route Completed Successfully
        {totalDuration && (
          <span className="d-block mt-1 small">
            Total time: {totalDuration.formatted}
          </span>
        )}
      </div>
    )}
  </div>
)}
                </div>
              </div>
            </div>
          </div>
        </PreviewCard>
      </div>
    </div>
  );
};
  if (loading && routes.length === 0 && routeAssignments.length === 0) {
    return (
      <Content>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Sales management data...</p>
        </div>
      </Content>
    );
  }

  return (
    <>
      <Head title="Delivery Management" />
      <Content>
        <BlockHead size="sm">
          <BlockHeadContent>
            <BlockTitle page>Sales Management</BlockTitle>
            <BlockDes>
              <p>Assign routes to Sales staff, track progress, and monitor performance</p>
            </BlockDes>
          </BlockHeadContent>
        </BlockHead>

        <Block>
          {/* Tabs Navigation */}
          <div className="nk-block-head">
            <ul className="custom-tabs">
              <li>
                <button
                  className={`tab-btn ${activeTab === "alignment" ? "active" : ""}`}
                  onClick={() => setActiveTab("alignment")}
                >
                  <Icon name="layers" />
                  <span>Customer Alignment</span>
                </button>
              </li>
              <li>
                <button
                  className={`tab-btn ${activeTab === "route" ? "active" : ""}`}
                  onClick={() => setActiveTab("route")}
                >
                  <Icon name="map" />
                  <span>Route Assign</span>
                </button>
              </li>

              <li>
                <button
                  className={`tab-btn ${activeTab === "track" ? "active" : ""}`}
                  onClick={() => setActiveTab("track")}
                >
                  <Icon name="location" />
                  <span>Live Track</span>
                </button>
              </li>
               

              
            </ul>
          </div>

          {/* Tab Content */}
          <div className="tab-content mt-4">
            <div className={`tab-pane ${activeTab === "route" ? "active" : ""}`}>
              {renderRouteAssign()}
            </div>
            <div className={`tab-pane ${activeTab === "track" ? "active" : ""}`}>
              {renderLiveTrack()}
            </div>
             <div className={`tab-pane ${activeTab === "alignment" ? "active" : ""}`}>
              {renderCustomerAlignment()}
            </div>
       
          </div>

          {/* Assign Route Modal */}
          <Modal isOpen={assignModal} toggle={() => setAssignModal(false)}>
            <ModalHeader toggle={() => setAssignModal(false)}>Assign Route</ModalHeader>
            <ModalBody>
              <FormGroup>
                <label className="form-label">Select Route</label>
                <Input
                  type="select"
                  {...register("routeId", { required: true })}
                  defaultValue=""
                >
                  <option value="" disabled>Select a route</option>
                  {Array.isArray(getAvailableRoutes()) && getAvailableRoutes().map(route => (
                    <option key={route.id || route._id} value={route.id || route._id}>
                      {route.name || route.routeName}
                    </option>
                  ))}
                </Input>
                {errors.routeId && <span className="text-danger">Route is required</span>}
              </FormGroup>

              <Button color="primary" onClick={handleSubmit(onSubmitAssignment)} disabled={loading}>
                {loading ? "Assigning..." : "Assign"}
              </Button>
            </ModalBody>
          </Modal>
          
         <Modal isOpen={confirmOpen} toggle={() => setConfirmOpen(false)} centered>
  <ModalBody className="text-center">
    <Icon name="alert-circle" className="text-danger mb-2" />

    <h5>Are you sure to unassign this route?</h5>

    <p className="text-muted">
      This action will remove the route from the staff for this day.
    </p>

    <ul className="d-flex justify-content-center mt-3">
      <li>
        <Button
          color="danger"
          className="mr-2"
          onClick={handleUnassignRoute}
          disabled={loading}
        >
          {loading ? "Unassigning..." : "Unassign"}
        </Button>
      </li>

      <li>
        <Button
          color="light"
          onClick={() => setConfirmOpen(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </li>
    </ul>
  </ModalBody>
</Modal>
          <Modal
            isOpen={viewCustomerModal}
            toggle={() => setViewCustomerModal(false)}
            size="lg"
            centered
          >
            <ModalHeader toggle={() => setViewCustomerModal(false)}>
              Customer Details
            </ModalHeader>

            <ModalBody>
              {selectedCustomer && (
                <div className="row g-4">

                  {/* Profile Section */}
                <div className="col-12">
            <div
              className="d-flex align-items-center p-3 bg-light rounded"
              style={{ gap: "15px" }} // horizontal spacing between items
            >
              {/* Avatar */}
              <div
                className="avatar avatar-lg bg-primary text-white d-flex align-items-center justify-content-center"
                style={{ fontSize: "20px", width: "60px", height: "60px" }}
              >
                {selectedCustomer.name.charAt(0)}
              </div>

              {/* Name & Phone */}
              <div className="d-flex flex-column">
                <h5 className="mb-1">{selectedCustomer.name}</h5>
                <span className="text-muted">{selectedCustomer.phone}</span>
              </div>

              {/* Line No Badge */}
              <div className="ms-auto">
                <Badge color="primary" className="px-3 py-2">
                  Line #{selectedCustomer.lineNo}
                </Badge>
              </div>
            </div>
          </div>


        {/* Info Cards */}
        <div className="col-md-6">
          <div className="card card-bordered h-100">
            <div className="card-inner">
              <h6 className="title mb-2">
                <Icon name="map-pin" className="me-1" /> Address
              </h6>
              <p className="mb-0 text-muted">
                {selectedCustomer.address}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card card-bordered h-100">
            <div className="card-inner">
              <h6 className="title mb-2">
                <Icon name="tag" className="me-1" /> Category
              </h6>
              <Badge color="light" className="px-3 py-2">
                {selectedCustomer.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Credit & Contact */}
        <div className="col-md-6">
          <div className="card card-bordered h-100">
            <div className="card-inner">
              <h6 className="title mb-2">
                <Icon name="clock" className="me-1" /> Credit Days
              </h6>
              <Badge
                color={selectedCustomer.creditDays > 30 ? "warning" : "success"}
                className="px-3 py-2"
              >
                {selectedCustomer.creditDays} Days
              </Badge>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card card-bordered h-100">
            <div className="card-inner">
              <h6 className="title mb-2">
                <Icon name="phone" className="me-1" /> Contact
              </h6>
              <p className="mb-0">{selectedCustomer.phone}</p>
            </div>
          </div>
        </div>

      </div>
    )}
  </ModalBody>
</Modal>


        </Block>
      </Content>
    </>
  );
};

export default Sales;