import { Alert, Badge, DropdownItem, DropdownMenu, FormGroup, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
import React, { useState, useEffect } from "react";
import { successToast, errorToast, warningToast } from "../../../utils/toaster";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import CustomerLiveMap from "./delivery/CustomerLiveMap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";
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

const Delivery = () => {
  const [activeTab, setActiveTab] = useState("alignment");
  const [vehicles, setVehicles] = useState([]);
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
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

    const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [selectedCustomerForMap, setSelectedCustomerForMap] = useState(null);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetchStaff();
    fetchRoutes();
    fetchCustomers();
    fetchBills();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAssignmentsByDate(selectedDate);
      fetchAvailableVehicles(selectedDate);
    }
  }, [selectedDate]);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        setVehicles([]);
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/vehicle`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (Array.isArray(res.data)) {
        setVehicles(res.data);
      } else if (Array.isArray(res.data?.data)) {
        setVehicles(res.data.data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error("Vehicle fetch error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        }
      }

      setVehicles([]);
    }
  };

  const fetchAvailableVehicles = async (date) => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/vehicle/getAvailableVehicle`, {
        params: { date },
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (res.status === 200) {
        setVehicles(res.data.data || []);
      }
    } catch (error) {
      console.error("Vehicle fetch error:", error);

      if (error.response) {
        if (error.response.status === 401) {
          console.log(error.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        }
      }

      setVehicles([]);
    }
  };
  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        setBills([]);
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/bills`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 200) {
        const allBills = response.data?.bills || [];
        setBills(allBills); // keep all bills including rejected
      }
    } catch (err) {
      console.log("FETCH BILLS ERROR:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        }
      }

      setBills([]);
    }
  };
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const last3DaysBills = bills.filter((bill) => {
    // Already filtered at fetch level, but double-check for safety
    return (
      new Date(bill.createdAt) >= threeDaysAgo && (bill.orderStatus === "approved" || bill.orderStatus === "delivered")
    );
  });

  const filterAssignedCustomer = assinedCustomerDatas.filter((customer) =>
    last3DaysBills.some((bill) => bill.customerId.toString() === customer._id.toString()),
  );

  useEffect(() => {
    const loadAssignedCustomers = async () => {
      if (!selectedStaffId) {
        setAssignedCustomerDatas([]);
        return;
      }

      const staffAssignments = routeAssignments.filter(
        (assignment) =>
          assignment.staffId?._id?.toString() === selectedStaffId.toString() && assignment.date === selectedDate,
      );

      if (staffAssignments.length === 0) {
        setAssignedCustomerDatas([]);
        return;
      }

      // If assigned → fetch customers
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKENDURL}/api/route-assignment/${selectedStaffId}/assignedCustomer`,
          {
            params: { date: selectedDate },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "session-token": localStorage.getItem("sessionToken"),
            },
          },
        );

        console.log(response.data.customers);

        if (response.status === 200) {
          setAssignedCustomerDatas(response.data.customers || []);
        }
      } catch (err) {
        setAssignedCustomerDatas([]);
      }
    };

    loadAssignedCustomers();
  }, [selectedStaffId, routeAssignments, selectedDate]);

  useEffect(() => {
    if (!selectedTrackStaff) return;

    const fetchLocation = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKENDURL}/api/location/latest/${selectedTrackStaff._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "session-token": localStorage.getItem("sessionToken"),
            },
          },
        );

        setLiveLocation({
          lat: res.data.latitude,
          lng: res.data.longitude,
          updatedAt: res.data.updatedAt,
          batteryLevel: res.data.batteryLevel,
          gpsStatus: res.data.gpsStatus,
          networkStatus: res.data.networkStatus,
          isOnline: res.data.isOnline,
        });
      } catch (err) {
        console.error("Live tracking error", err);
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

    return (
      routes.find((r) => {
        const id = r._id || r.id;
        return String(id) === String(routeId);
      }) || null
    );
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/staff`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });

      if (Array.isArray(res.data)) {
        const datas = res.data;
        const filteredStaffDatas = datas.filter((item) => item.type === "delivery");

        setDeliveryStaff(filteredStaffDatas);
      } else {
        console.warn("Staff data is not in expected format:", res.data);
        setDeliveryStaff([]);
      }
    } catch (err) {
      console.error("STAFF FETCH ERROR 👉", err);
      setError("Failed to load staff");
      setDeliveryStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentsByDate = async (date) => {
    try {
      setLoading(true);

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/route-assignment?date=${date}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });

      // Ensure we set an array
      let assignmentsData = res.data;
      if (assignmentsData && Array.isArray(assignmentsData.data)) {
        setRouteAssignments(assignmentsData.data);
      } else if (Array.isArray(assignmentsData)) {
        setRouteAssignments(assignmentsData);
      } else {
        console.warn("Assignments data is not in expected format:", assignmentsData);
        setRouteAssignments([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load route assignments");
      setRouteAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/route`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });

      // Check if the response is an array
      let routesData = res.data;

      // If it's an object with a data property that's an array
      if (routesData && routesData.data && Array.isArray(routesData.data)) {
        setRoutes(routesData.data);
      }
      // If the response itself is an array
      else if (Array.isArray(routesData)) {
        setRoutes(routesData);
      }
      // Otherwise set empty array
      else {
        console.warn("Routes data is not in expected format:", routesData);
        setRoutes([]);
      }
    } catch (err) {
      console.error("ROUTES FETCH ERROR 👉", err);
      setError("Failed to load routes");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };
  // After fetching customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/customer`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });

      setCustomers(res.data.filter((c) => !c.isDeleted && c.status));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");
      }

      console.error(err);
      errorToast("Failed to fetch customers");
    }
  };

  const filteredDeliveryStaff = Array.isArray(deliveryStaff)
    ? deliveryStaff.filter((staff) => staff.isDeleted === false)
    : [];

  // Get routes already assigned to a specific staff member on selected date
  const getStaffAssignedRoutes = (staffId) => {
    if (!Array.isArray(routeAssignments)) return [];

    return routeAssignments.filter(
      (assignment) => assignment.staffId?._id?.toString() === staffId?.toString() && assignment.date === selectedDate,
    );
  };

  // Get available routes (not assigned to anyone on selected date)
  const getAvailableRoutes = () => {
    // Ensure both are arrays
    if (!Array.isArray(routeAssignments) || !Array.isArray(routes)) {
      console.warn("routeAssignments or routes is not an array:", {
        routeAssignments,
        routes,
      });
      return [];
    }

    const assignedRouteIds = routeAssignments
      .filter((a) => a && a.date === selectedDate)
      .map((a) => {
        // Handle both string and object routeId
        if (typeof a.routeId === "object" && a.routeId !== null) {
          return String(a.routeId._id || a.routeId.id);
        }
        return String(a.routeId);
      })
      .filter((id) => id && id !== "undefined");

    return routes.filter((r) => {
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
    switch (status) {
      case "ASSIGNED":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      case "COMPLETED":
        return "success";
      default:
        return "light";
    }
  };

  // Handle route assignment submission
  const onSubmitAssignment = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const route = findRoute(data.routeId);

      if (!route) {
        setError("Selected route not found");
        return;
      }

      const isRouteAlreadyAssigned = routeAssignments.some((assignment) => {
        const assignmentRouteId =
          typeof assignment.routeId === "object" ? assignment.routeId._id || assignment.routeId.id : assignment.routeId;
        return String(assignmentRouteId) === String(data.routeId) && assignment.date === selectedDate;
      });

      if (isRouteAlreadyAssigned) {
        setError("This route is already assigned for the selected date");
        return;
      }

      const newAssignment = {
        _id: Date.now().toString(),
        date: selectedDate,
        staffId: selectedStaff._id,
        routeId: data.routeId,
        routeName: route.routeName || route.name,
        status: "ASSIGNED",
        createdAt: new Date().toISOString(),
      };

      setRouteAssignments((prev) => [...prev, newAssignment]);
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

      await axios.delete(`${process.env.REACT_APP_BACKENDURL}/api/route-assignment/${selectedAssignmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });

      // Remove from state
      setRouteAssignments((prev) => (Array.isArray(prev) ? prev.filter((a) => a._id !== selectedAssignmentId) : []));

      setSuccess("Route unassigned successfully");
      setTimeout(() => setSuccess(null), 3000);

      setConfirmOpen(false);
      setSelectedAssignmentId(null);
    } catch (err) {
      console.error("Unassign Error:", err.response?.data || err.message);
      setError("Failed to unassign route");
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
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const routeCustomers = customers.filter((c) => String(c.routeId) === String(selectedRouteForAlignment));

    const otherCustomers = customers.filter((c) => String(c.routeId) !== String(selectedRouteForAlignment));

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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "session-token": localStorage.getItem("sessionToken"),
          },
        },
      );

      if (res.data.status === "success") {
        successToast("Alignment saved successfully");
        fetchCustomers();
      } else {
        errorToast("Failed to save alignment");
      }
    } catch (err) {
      console.error("SAVE ALIGNMENT ERROR 👉", err.response?.data || err);
      // errorToast(err.response?.data?.error || "Save failed");
    } finally {
      setIsSavingAlignment(false);
    }
  };
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewCustomerModal(true);
  };

  const sortedCustomers = [...assinedCustomerDatas].sort((a, b) => a.lineNo - b.lineNo);

  const firstPendingCustomer = sortedCustomers.find((customer) => customer.orderPending === true);

  const currentLineNo = firstPendingCustomer ? firstPendingCustomer.lineNo : null;
  // const assignedVehicleNumbers = routeAssignments
  //   .filter(a => a.date === selectedDate && a.vehicleNo)
  //   .map(a => a.vehicleNo);
  // Render Route Assign Tab
  const assignedVehicleData = routeAssignments
    .filter((a) => a.date === selectedDate && a.vehicleNo)
    .map((a) => ({
      vehicleNo: a.vehicleNo,
      staffId: a.staffId?._id,
    }));
  const renderRouteAssign = () => {
    if (loading && routeAssignments.length === 0) {
      return <div className="text-center py-5">Loading...</div>;
    }

    if (!Array.isArray(routes)) {
      return <Alert color="danger">Routes data is not in expected format. Please try refreshing the page.</Alert>;
    }

    const handlesRefresh = () => {
      fetchStaff();
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
                <div style={{ marginRight: "10px" }}>
                  <Input
                    type="date"
                    lang="en-GB"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control"
                  />
                </div>

                {/* Refresh Button */}
                <button type="button" className="btn btn-primary" onClick={handlesRefresh}>
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
            <div className="table-responsive" style={{ borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
              <table className="table table-hover mb-0" style={{ minWidth: "1000px", fontSize: "0.85rem" }}>
                <thead style={{ backgroundColor: "#f8f9fc", borderBottom: "1px solid #e9ecef" }}>
                  <tr>
                    <th
                      style={{
                        padding: "10px 80px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Staff
                    </th>
                    <th
                      style={{
                        padding: "10px 80px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Assigned Routes
                    </th>
                    <th
                      style={{
                        padding: "10px 80x",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Load
                    </th>
                    <th
                      style={{
                        padding: "10px 80px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredDeliveryStaff) &&
                    filteredDeliveryStaff.map((staff) => {
                      const staffAssignments = getStaffAssignedRoutes(staff._id);
                      const existingVehicleNo = staffAssignments.length > 0 ? staffAssignments[0].vehicleNo : null;
                      const canAssign = canAssignMoreRoutes(staff._id);

                      return (
                        <tr key={staff._id} style={{ borderBottom: "1px solid #edf2f7" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <div className="d-flex align-items-center">
                              <img
                                src={staff.img || "/default-avatar.png"}
                                alt=""
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/default-avatar.png";
                                }}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  marginRight: "8px",
                                  border: "1px solid #fff",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: "500", color: "#2c3e50", fontSize: "0.85rem" }}>
                                  {staff.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "#8a9cb0",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                  </svg>
                                  {staff.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "10px 12px" }}>
                            {staffAssignments?.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {staffAssignments.map((assignment) => (
                                  <div
                                    key={assignment._id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      backgroundColor: "#f8fafd",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      border: "1px solid #eef2f6",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    <div>
                                      <span style={{ fontWeight: "500", color: "#2c3e50" }}>
                                        {assignment.routeId?.routeName || assignment.routeName}
                                      </span>
                                      {assignment.vehicleNo && (
                                        <span style={{ fontSize: "0.7rem", color: "#8a9cb0", marginLeft: "6px" }}>
                                          • 🚗 {assignment.vehicleNo}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                      <span
                                        style={{
                                          padding: "2px 6px",
                                          borderRadius: "12px",
                                          fontSize: "0.65rem",
                                          fontWeight: "500",
                                          backgroundColor: assignment.status === "ASSIGNED" ? "#e8f0fe" : "#fff4e5",
                                          color: assignment.status === "ASSIGNED" ? "#2c6b9e" : "#cc7b2e",
                                        }}
                                      >
                                        {assignment.status?.replace("_", " ") || "ASGN"}
                                      </span>
                                      <button
                                        onClick={() => openUnassignConfirm(assignment._id)}
                                        style={{
                                          border: "none",
                                          background: "none",
                                          padding: "2px",
                                          cursor: "pointer",
                                          borderRadius: "3px",
                                          color: "#dc3545",
                                          opacity: 0.6,
                                          lineHeight: 1,
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                                      >
                                        <svg
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: "#a0b3c9", fontSize: "0.8rem", fontStyle: "italic" }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "6px",
                                  backgroundColor: staffAssignments?.length === 0 ? "#f1f5f9" : "#e8f0fe",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "600",
                                  color: staffAssignments?.length === 0 ? "#8a9cb0" : "#2c6b9e",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {staffAssignments?.length || 0}
                              </div>
                              <span style={{ color: "#8a9cb0", fontSize: "0.75rem" }}>/2</span>
                            </div>
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: "35px", alignItems: "center", flexWrap: "wrap" }}>
                              {/* Route Select - Increased Width */}
                              <div style={{ position: "relative", width: "160px" }}>
                                <select
                                  style={{
                                    width: "120%",
                                    padding: "8px 28px 8px 12px",

                                    borderRadius: "6px",
                                    border: "1px solid #e0e7ed",
                                    backgroundColor: "#fff",
                                    fontSize: "0.85rem",
                                    color: "#2c3e50",
                                    outline: "none",
                                    cursor: "pointer",
                                    appearance: "none",
                                    transition: "all 0.2s",
                                  }}
                                  value={staff.selectedRoute || ""}
                                  onChange={(e) => {
                                    setDeliveryStaff((prev) =>
                                      prev.map((s) =>
                                        s._id === staff._id ? { ...s, selectedRoute: e.target.value } : s,
                                      ),
                                    );
                                  }}
                                  onFocus={(e) => (e.target.style.borderColor = "#2c6b9e")}
                                  onBlur={(e) => (e.target.style.borderColor = "#e0e7ed")}
                                >
                                  <option value="">Select Route</option>
                                  {getAvailableRoutes().map((route) => (
                                    <option key={route._id} value={route._id}>
                                      {route.routeName}
                                    </option>
                                  ))}
                                </select>
                                <div
                                  style={{
                                    position: "absolute",
                                    right: "10px",
                                    left: "165px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                    color: "#8a9cb0",
                                    fontSize: "11px",
                                  }}
                                >
                                  ▼
                                </div>
                              </div>

                              {/* Vehicle Select - Increased Width */}
                              <div style={{ position: "relative", width: "140px" }}>
                                <select
                                  style={{
                                    width: "120%",
                                    padding: "8px 28px 8px 12px",
                                    borderRadius: "6px",
                                    marginLeft: "10px",
                                    border: "1px solid #e0e7ed",
                                    backgroundColor: existingVehicleNo ? "#f8fafd" : "#fff",
                                    fontSize: "0.85rem",
                                    color: existingVehicleNo ? "#8a9cb0" : "#2c3e50",
                                    outline: "none",
                                    cursor: existingVehicleNo ? "not-allowed" : "pointer",
                                    appearance: "none",
                                    transition: "all 0.2s",
                                  }}
                                  disabled={!!existingVehicleNo}
                                  value={existingVehicleNo || staff.selectedVehicle || ""}
                                  onChange={(e) => {
                                    setDeliveryStaff((prev) =>
                                      prev.map((s) =>
                                        s._id === staff._id ? { ...s, selectedVehicle: e.target.value } : s,
                                      ),
                                    );
                                  }}
                                  onFocus={(e) => {
                                    if (!existingVehicleNo) e.target.style.borderColor = "#2c6b9e";
                                  }}
                                  onBlur={(e) => (e.target.style.borderColor = "#e0e7ed")}
                                >
                                  <option value="">Select Vehicle</option>
                                  {vehicles
                                    .filter((vehicle) => {
                                      if (existingVehicleNo) {
                                        return vehicle.vehicleNumber === existingVehicleNo;
                                      }
                                      const vehicleAssignments = assignedVehicleData.filter(
                                        (v) => v.vehicleNo === vehicle.vehicleNumber,
                                      );
                                      if (vehicleAssignments.length === 0) return true;
                                      return vehicleAssignments.every(
                                        (v) => v.staffId?.toString() === staff._id.toString(),
                                      );
                                    })
                                    .map((vehicle) => (
                                      <option key={vehicle._id} value={vehicle._id}>
                                        {vehicle.vehicleNumber} ({vehicle.vehicleType})
                                      </option>
                                    ))}
                                </select>
                                <div
                                  style={{
                                    position: "absolute",
                                    right: "10px",
                                    left: "150px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                    color: "#8a9cb0",
                                    fontSize: "11px",
                                  }}
                                >
                                  ▼
                                </div>
                              </div>

                              {/* Assign Button - Increased Size */}
                              <button
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "6px",
                                  marginLeft: "auto",
                                  border: "none",
                                  backgroundColor:
                                    !staff.selectedRoute ||
                                    (!existingVehicleNo && !staff.selectedVehicle) ||
                                    !canAssignMoreRoutes(staff._id) ||
                                    loading
                                      ? "#f1f5f9"
                                      : "#2c6b9e",
                                  color:
                                    !staff.selectedRoute ||
                                    (!existingVehicleNo && !staff.selectedVehicle) ||
                                    !canAssignMoreRoutes(staff._id) ||
                                    loading
                                      ? "#8a9cb0"
                                      : "#fff",
                                  fontSize: "0.85rem",
                                  fontWeight: "500",
                                  cursor:
                                    !staff.selectedRoute ||
                                    (!existingVehicleNo && !staff.selectedVehicle) ||
                                    !canAssignMoreRoutes(staff._id) ||
                                    loading
                                      ? "not-allowed"
                                      : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  lineHeight: 1,
                                  minWidth: "80px",
                                  justifyContent: "center",
                                  transition: "all 0.2s",
                                  boxShadow:
                                    !staff.selectedRoute ||
                                    (!existingVehicleNo && !staff.selectedVehicle) ||
                                    !canAssignMoreRoutes(staff._id) ||
                                    loading
                                      ? "none"
                                      : "0 2px 4px rgba(44,107,158,0.2)",
                                }}
                                disabled={
                                  !staff.selectedRoute ||
                                  (!existingVehicleNo && !staff.selectedVehicle) ||
                                  !canAssignMoreRoutes(staff._id) ||
                                  loading
                                }
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    setError(null);

                                    const route = findRoute(staff.selectedRoute);
                                    if (!route) {
                                      setError("Selected route not found");
                                      return;
                                    }

                                    let vehicleToSend = existingVehicleNo;
                                    if (!vehicleToSend) {
                                      const selectedVehicleData = vehicles.find((v) => v._id === staff.selectedVehicle);
                                      vehicleToSend = selectedVehicleData?.vehicleNumber || null;
                                    }

                                    await axios.post(
                                      `${process.env.REACT_APP_BACKENDURL}/api/route-assignment`,
                                      {
                                        date: selectedDate,
                                        staffId: staff._id,
                                        routeId: route._id,
                                        routeName: route.routeName,
                                        vehicleNo: vehicleToSend,
                                      },
                                      {
                                        headers: {
                                          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                          "session-token": localStorage.getItem("sessionToken"),
                                        },
                                      },
                                    );

                                    setSuccess(`Route assigned to ${staff.name}`);
                                    fetchAssignmentsByDate(selectedDate);

                                    setDeliveryStaff((prev) =>
                                      prev.map((s) =>
                                        s._id === staff._id ? { ...s, selectedRoute: "", selectedVehicle: "" } : s,
                                      ),
                                    );
                                  } catch (err) {
                                    setError(err.response?.data?.message || "Failed to assign route");
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                onMouseEnter={(e) => {
                                  if (
                                    !(
                                      !staff.selectedRoute ||
                                      (!existingVehicleNo && !staff.selectedVehicle) ||
                                      !canAssignMoreRoutes(staff._id) ||
                                      loading
                                    )
                                  ) {
                                    e.currentTarget.style.backgroundColor = "#1e4f72";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(44,107,158,0.25)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (
                                    !(
                                      !staff.selectedRoute ||
                                      (!existingVehicleNo && !staff.selectedVehicle) ||
                                      !canAssignMoreRoutes(staff._id) ||
                                      loading
                                    )
                                  ) {
                                    e.currentTarget.style.backgroundColor = "#2c6b9e";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(44,107,158,0.2)";
                                  }
                                }}
                              >
                                {loading ? (
                                  <>
                                    <span
                                      style={{
                                        width: "14px",
                                        height: "14px",
                                        border: "2px solid #fff",
                                        borderTopColor: "transparent",
                                        borderRadius: "50%",
                                        animation: "spin 0.6s linear infinite",
                                        display: "inline-block",
                                      }}
                                    ></span>
                                    <span>Assigning...</span>
                                  </>
                                ) : (
                                  "Assign"
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
                to {
                  transform: rotate(360deg);
                }
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
                        <h6 className="mb-1">
                          {assignment.routeId?.routeName || assignment.routeName}
                          {assignment.vehicleNo && <small className="text-muted">🚗 {assignment.vehicleNo}</small>}
                        </h6>
                        <p className="mb-0 small text-primary">
                          Assigned to: {assignment.staffId?.name || assignment.staffId}
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
    const selectedRoute = routes.find((route) => String(route._id) === String(selectedRouteForAlignment));

    const routeCustomers = customers
      .filter((c) => String(c.routeId) === String(selectedRouteForAlignment))
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
                <div className="form-group" style={{ minWidth: "200px" }}>
                  <label className="form-label ml-1">Select Route</label>
                  <select
                    className="form-control"
                    style={{ padding: "2px" }}
                    value={selectedRouteForAlignment}
                    onChange={(e) => setSelectedRouteForAlignment(e.target.value)}
                  >
                    <option value="">Select Route</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.routeName}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  color="primary"
                  style={{ padding: "20px", marginLeft: "10px" }}
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
                      {selectedRoute ? `${selectedRoute.routeName} - Delivery Line Order` : "Select a Route"}
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
                                <Draggable key={customer._id} draggableId={customer._id} index={index}>
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
                                          <div
                                            style={{ display: "flex", justifyContent: "space-between" }}
                                            className="d-flex w-100 pr-2"
                                          >
                                            <strong>{customer.name}</strong>

                                            {customer.isNew && (
                                              <strong
                                                style={{
                                                  backgroundColor: "#f2f2f2",
                                                  width: "45px",
                                                  textAlign: "center",
                                                  marginTop: "5px",
                                                  fontSize: "12px",
                                                }}
                                                className="ms-auto text-danger"
                                              >
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
                              <p className="text-center text-muted">No customers assigned to this route</p>
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
                          <div className="text-truncate" style={{ maxWidth: "200px" }}>
                            {customer.address}
                          </div>
                        </td>
                        <td>{customer.phone}</td>
                        <td>
                          <Badge color="light">{customer.category}</Badge>
                        </td>
                        <td>
                          <Badge color={customer.creditDays > 30 ? "warning" : "success"}>
                            {customer.creditDays} Days
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="md"
                              style={{ height: "30px" }}
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
  const renderLiveTrack = () => {
    if (!Array.isArray(routeAssignments) || !Array.isArray(filteredDeliveryStaff)) {
      return <Alert color="danger">Data is not available. Please try refreshing the page.</Alert>;
    }

    const assignmentsForDate = routeAssignments.filter((a) => a.date === selectedDate);
    const assignedStaffIds = assignmentsForDate.map((a) => String(a.staffId?._id || a.staffId));
    const assignedStaff = filteredDeliveryStaff.filter((staff) => assignedStaffIds.includes(String(staff._id)));

    // Get active deliveries (IN_PROGRESS) for selected date
    const activeDeliveries = routeAssignments.filter((a) => a.date === selectedDate && a.status === "IN_PROGRESS");

    // Get staff with active deliveries
    const staffWithActiveDeliveries = filteredDeliveryStaff.filter((staff) =>
      activeDeliveries.some((delivery) => String(delivery.staffId?._id || delivery.staffId) === String(staff._id)),
    );

    const selectedStaffDelivery = selectedTrackStaff
      ? activeDeliveries.find(
          (delivery) => String(delivery.staffId?._id || delivery.staffId) === String(selectedTrackStaff._id),
        )
      : null;

    // Get the route IDs assigned to the selected staff for the selected date
    const selectedStaffRouteIds = selectedTrackStaff
      ? routeAssignments
          .filter(
            (a) => a.date === selectedDate && String(a.staffId?._id || a.staffId) === String(selectedTrackStaff._id),
          )
          .map((a) => String(a.routeId?._id || a.routeId))
      : [];

    console.log("=== ROUTE ASSIGNMENTS FOR SELECTED STAFF ===");
    console.log("Selected Staff:", selectedTrackStaff?.name);
    console.log("Selected Date:", selectedDate);
    console.log("Assigned Route IDs:", selectedStaffRouteIds);

    // Log all route assignments for this date to see what's assigned
    const allAssignmentsForDate = routeAssignments.filter((a) => a.date === selectedDate);
    console.log(
      "All assignments for date:",
      allAssignmentsForDate.map((a) => ({
        staff: a.staffId?.name || a.staffId,
        route: a.routeId?.routeName || a.routeName,
        routeId: String(a.routeId?._id || a.routeId),
      })),
    );

    console.log("=== CUSTOMER FILTERING ===");
    console.log("Total customers in system:", customers?.length);

    // First, see all customers that belong to the assigned routes
    const customersInAssignedRoutes = (customers || []).filter((c) =>
      selectedStaffRouteIds.includes(String(c.routeId)),
    );
    console.log(
      "Customers in assigned routes:",
      customersInAssignedRoutes.map((c) => ({
        name: c.name,
        routeId: c.routeId,
        orderPending: c.orderPending,
      })),
    );

    // Then apply the filter - check ONLY the most recent bill
    const displayCustomers = customersInAssignedRoutes.filter((customer) => {
      // Find all bills for this customer
      const customerBills = bills.filter((bill) => String(bill.customerId) === String(customer._id));

      // If customer has no bills, DON'T show them (since we need to check bill status)
      if (customerBills.length === 0) {
        console.log(`Customer ${customer.name} has no bills - NOT showing`);
        return false;
      }

      // Sort bills by createdAt/updatedAt to get the most recent
      const sortedBills = customerBills.sort(
        (a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt),
      );

      // Get the most recent bill
      const lastBill = sortedBills[0];

      // Check if the last bill status is either 'delivered' or 'approved'
      const isValidBillStatus = ["delivered", "approved"].includes(lastBill.orderStatus);

      console.log(`Customer ${customer.name}:`, {
        totalBills: customerBills.length,
        lastBillStatus: lastBill.orderStatus,
        lastBillDate: lastBill.createdAt || lastBill.updatedAt,
        isValidBillStatus,
        orderPending: customer.orderPending,
        showCustomer: isValidBillStatus,
      });

      // SHOW customer ONLY if the last bill is either delivered OR approved
      return isValidBillStatus;
    });

    console.log(
      "Final display customers:",
      displayCustomers.map((c) => ({
        name: c.name,
        routeId: c.routeId,
        orderPending: c.orderPending,
        lastBillStatus: (() => {
          const customerBills = bills.filter((bill) => String(bill.customerId) === String(c._id));
          if (customerBills.length > 0) {
            const sortedBills = customerBills.sort(
              (a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt),
            );
            return sortedBills[0].orderStatus;
          }
          return "no bills";
        })(),
      })),
    );

    // Define totalCustomers HERE, before it's used
    const totalCustomers = displayCustomers?.length || 0;

    // For delivery status based on orderPending flag
    const getCustomerDeliveryStatus = (customer) => {
      const isArriving = customer.orderPending === true;
      const isDelivered = customer.orderPending === false;

      return {
        isArriving: isArriving,
        isDelivered: isDelivered,
        deliveredAt: null, // You might want to add a deliveredAt field to customers if available
      };
    };

    // Helper function to calculate duration from start time to customer delivery
    const getCustomerDuration = (customer) => {
      if (!selectedTrackStaff?.startedAt) return null;

      // Check if customer has a deliveredAt timestamp (you may need to add this to your customer object)
      // For now, we'll use the current time if orderPending is false (delivered)
      if (customer.orderPending === false) {
        // If you have a deliveredAt field in customer, use that
        // Otherwise, you might need to get this from bills or another source
        const deliveryTime = customer.deliveredAt ? new Date(customer.deliveredAt).getTime() : new Date().getTime();
        const startTime = new Date(selectedTrackStaff.startedAt).getTime();
        const diffMinutes = Math.round((deliveryTime - startTime) / (1000 * 60));

        if (diffMinutes > 0) {
          const hours = Math.floor(diffMinutes / 60);
          const mins = diffMinutes % 60;
          return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }
      }
      return null;
    };

    const completedCustomers =
      displayCustomers?.filter((c) => {
        const { isDelivered } = getCustomerDeliveryStatus(c);
        return isDelivered;
      }).length || 0;

    const isRouteCompleted = totalCustomers > 0 && completedCustomers === totalCustomers;

    const getCustomerStatusClass = (status) => {
      switch (status) {
        case "delivered":
          return "text-success";
        case "arriving":
          return "text-primary";
        default:
          return "text-muted";
      }
    };

    const getRailIcon = (status) => {
      if (status === "delivered") {
        return <Icon name="check-circle-fill" className="text-success" />;
      }
      if (status === "arriving") {
        return <Icon name="truck" className="text-primary" />;
      }
      return <Icon name="clock" className="text-muted" />;
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return null;
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const handleRefresh = () => {
      fetchCustomers();
      fetchAssignmentsByDate(selectedDate);
      fetchBills();
    };

    return (
      <div className="row g-4">
        <div className="col-12">
          <PreviewCard>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="title">Live Delivery Tracking</h5>
                <p className="text-soft mb-0">Track deliveries in real-time on the map</p>
              </div>

              <div className="d-flex gap-2 align-items-end">
                <div style={{ marginRight: "10px" }}>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control"
                  />
                </div>

                {/* Refresh Button */}
                <button type="button" className="btn btn-primary" onClick={handleRefresh}>
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
                      <h6 className="title">Active Delivery Staff</h6>
                    </div>

                    <div className="mb-3">
                      <div className="input-group input-group-sm">
                        <Input type="text" placeholder="Search staff..." className="form-control form-control-sm" />
                      </div>
                    </div>

                    <div className="staff-list" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      {assignedStaff.map((staff) => {
                        const staffDelivery = activeDeliveries.find(
                          (d) => String(d.staffId?._id || d.staffId) === String(staff._id),
                        );

                        const isSelected = selectedTrackStaff?._id === staff._id;

                        return (
                          <div
                            key={staff._id}
                            className={`staff-card mb-2 p-2 border rounded cursor-pointer ${isSelected ? "selected-staff" : ""}`}
                            onClick={() => {
                              setSelectedTrackStaff(staff);
                              setSelectedStaffId(staff._id);
                            }}
                            style={{
                              cursor: "pointer",
                              borderColor: isSelected ? "#6576ff" : "#e5e9f2",
                              backgroundColor: isSelected ? "rgba(101, 118, 255, 0.04)" : "#fff",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <div
                                  className="avatar avatar-xxs mr-1 bg-primary me-2 d-flex align-items-center justify-content-center"
                                  style={{ width: "20px", height: "20px", borderRadius: "50%" }}
                                >
                                  <span>{staff.name?.charAt(0) || "S"}</span>
                                </div>
                                <div className="lh-1">
                                  <div className="fw-medium fs-13">{staff.name}</div>
                                  <div className="text-muted fs-11">{staff.phone}</div>
                                </div>
                              </div>
                              {staffDelivery && (
                                <Badge size="sm" color={getStatusBadge(staffDelivery.status)} className="fs-10">
                                  {staffDelivery.status?.replace("_", " ")}
                                </Badge>
                              )}
                            </div>
                            {staffDelivery && (
                              <div className="mt-1">
                                <small className="text-muted fs-11">
                                  Route: <span className="fw-medium text-dark ms-1">{staffDelivery.routeName}</span>
                                </small>
                                {staff.startedAt && (
                                  <small className="text-muted fs-11 d-block">
                                    Started: {formatTime(staff.startedAt)}
                                  </small>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card card-bordered h-100">
                  <div className="card-inner">
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
                          {new Date(liveLocation.updatedAt || liveLocation.timeStamp || Date.now()).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit", hour12: true },
                          )}
                        </p>
                      )}
                    </div>

                    <CustomerLiveMap
                      staff={selectedTrackStaff ? { ...selectedTrackStaff, location: liveLocation } : null}
                      customers={displayCustomers}
                      selectedCustomer={selectedCustomerForMap}
                      travelMode="DRIVING"
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card card-bordered h-100">
                  <div className="card-inner">
                    <div className="mb-3">
                      <div className="mb-1">
                        <h6 className="title d-flex align-items-center mb-0">
                          <span className="me-1" style={{ fontSize: "27px", lineHeight: 1 }}>
                            🚚
                          </span>
                          Delivery Vehicle{" "}
                          <Badge color={isRouteCompleted ? "success" : "primary"} className="fs-11 ms-2">
                            Status : {isRouteCompleted ? "Completed" : "Running"}
                          </Badge>
                        </h6>
                      </div>
                      <small className="text-muted d-block mt-2">
                        {selectedTrackStaff?.startedAt && (
                          <span className="me-3">
                            <span className="fw-medium">Started:</span> {formatTime(selectedTrackStaff.startedAt)}
                          </span>
                        )}
                        {selectedTrackStaff?.endedAt && (
                          <span className="me-3">
                            <span className="fw-medium">Ended:</span> {formatTime(selectedTrackStaff.endedAt)}
                          </span>
                        )}
                      </small>
                    </div>

                    {!displayCustomers || displayCustomers.length === 0 ? (
                      <div className="text-center py-5">
                        <div style={{ fontSize: "40px" }}>📍</div>
                        <h6 className="mt-3 mb-1">No Routes Assigned</h6>
                        <p className="text-muted mb-0">
                          {selectedTrackStaff
                            ? `${selectedTrackStaff.name} has no routes assigned for today.`
                            : "Select a staff member to view their route."}
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
                                {selectedTrackStaff?.startedAt ? formatTime(selectedTrackStaff.startedAt) : "--:--"}
                              </span>
                            </div>
                            <small className="text-muted">Trip Started • 0 km</small>
                          </div>
                        </div>

                        {/* CUSTOMERS */}
                        {displayCustomers
                          .sort((a, b) => a.lineNo - b.lineNo)
                          .map((customer, index) => {
                            const isActiveCustomer = selectedCustomerForMap?._id === customer._id;
                            const { isArriving, isDelivered } = getCustomerDeliveryStatus(customer);
                            let rowStatus = isDelivered ? "delivered" : "arriving";

                            // Calculate duration from start time to this customer
                            const duration = getCustomerDuration(customer);

                            return (
                              <div
                                className={`rail-row ${rowStatus} ${isActiveCustomer ? "active-customer" : ""}`}
                                key={customer._id}
                                onClick={() => setSelectedCustomerForMap(customer)}
                              >
                                <div className="rail-left">
                                  {rowStatus === "arriving" ? (
                                    <div className="rail-van">
                                      <div className="rail-icon">{getRailIcon(rowStatus)}</div>
                                    </div>
                                  ) : (
                                    <div className="rail-dot"></div>
                                  )}
                                  {index !== displayCustomers.length - 1 && <div className="rail-line"></div>}
                                </div>
                                <div className="rail-content">
                                  <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center flex-wrap" style={{ gap: "8px" }}>
                                      <strong>
                                        {customer.name}
                                        {isDelivered && duration && (
                                          <span
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              color: "#6c757d",
                                              fontSize: "11px",
                                              backgroundColor: "#f8f9fa",
                                              padding: "2px 6px",
                                              borderRadius: "4px",
                                              fontWeight: "500",
                                              gap: "3px",
                                            }}
                                          >
                                            <span style={{ fontSize: "11px" }}>⏱️</span>+{duration}
                                          </span>
                                        )}
                                      </strong>
                                      {/* Clock icon with duration - only show for delivered customers */}
                                    </div>
                                    <span
                                      className={``}
                                      style={{
                                        color: rowStatus === "delivered" ? "#10b981" : "#f59e0b", // green for delivered, orange/yellow for arriving
                                        fontWeight: "500",
                                        fontSize: "11px",
                                      }}
                                    >
                                      {rowStatus === "delivered" ? "Delivered" : "Arriving"}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-1">
                                    <small className={rowStatus === "arriving" ? "text-primary" : "text-muted"}>
                                      Line No: {customer.lineNo} • {customer.routeName}
                                    </small>
                                    {/* Show delivery time for delivered customers */}
                                    {isDelivered && (
                                      <span style={{ fontSize: "12px" }}>
                                        {formatTime(new Date())} {/* Replace with actual deliveredAt if available */}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                        {/* END POINT - Warehouse */}
                        <div className={`rail-row ${isRouteCompleted ? "completed" : "upcoming"}`}>
                          <div className="rail-left">
                            <div className="rail-dot"></div>
                          </div>
                          <div className="rail-content">
                            <div className="d-flex justify-content-between">
                              <strong>Route End (Warehouse)</strong>
                              <span className="time">
                                {selectedTrackStaff?.endedAt ? formatTime(selectedTrackStaff.endedAt) : "--:--"}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">Trip Completion</small>
                              {/* Show total duration if route is completed */}
                              {isRouteCompleted && selectedTrackStaff?.startedAt && selectedTrackStaff?.endedAt && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#10b981",
                                    fontWeight: "500",
                                  }}
                                >
                                  Total:{" "}
                                  {(() => {
                                    const start = new Date(selectedTrackStaff.startedAt).getTime();
                                    const end = new Date(selectedTrackStaff.endedAt).getTime();
                                    const diffMinutes = Math.round((end - start) / (1000 * 60));
                                    const hours = Math.floor(diffMinutes / 60);
                                    const mins = diffMinutes % 60;
                                    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                                  })()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isRouteCompleted && (
                          <div className="alert alert-success py-2 mb-3">
                            🎉 All Customers Delivered – Route Completed Successfully
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
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" style={{ marginTop: "230px" }} role="status"></div>
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
            <BlockTitle page>Delivery Management</BlockTitle>
            <BlockDes>
              <p>Assign routes to delivery staff, track progress, and monitor performance</p>
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
            <div className={`tab-pane ${activeTab === "route" ? "active" : ""}`}>{renderRouteAssign()}</div>
            <div className={`tab-pane ${activeTab === "track" ? "active" : ""}`}>{renderLiveTrack()}</div>
            <div className={`tab-pane ${activeTab === "alignment" ? "active" : ""}`}>{renderCustomerAlignment()}</div>
          </div>

          {/* Assign Route Modal */}
          <Modal isOpen={assignModal} toggle={() => setAssignModal(false)}>
            <ModalHeader toggle={() => setAssignModal(false)}>Assign Route</ModalHeader>
            <ModalBody>
              <FormGroup>
                <label className="form-label">Select Route</label>
                <Input type="select" {...register("routeId", { required: true })} defaultValue="">
                  <option value="" disabled>
                    Select a route
                  </option>
                  {Array.isArray(getAvailableRoutes()) &&
                    getAvailableRoutes().map((route) => (
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

              <p className="text-muted mb-2">This will remove the route from the staff for this day.</p>

              <ul className="d-flex justify-content-center mt-3">
                <li>
                  <Button color="danger" className="mr-2" onClick={handleUnassignRoute} disabled={loading}>
                    {loading ? "Unassigning..." : "Unassign"}
                  </Button>
                </li>
                <li>
                  <Button color="light" onClick={() => setConfirmOpen(false)} disabled={loading}>
                    Cancel
                  </Button>
                </li>
              </ul>
            </ModalBody>
          </Modal>
          <Modal isOpen={viewCustomerModal} toggle={() => setViewCustomerModal(false)} size="lg" centered>
            <ModalHeader toggle={() => setViewCustomerModal(false)}>Customer Details</ModalHeader>

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
                        <p className="mb-0 text-muted">{selectedCustomer.address}</p>
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
                        <Badge color={selectedCustomer.creditDays > 30 ? "warning" : "success"} className="px-3 py-2">
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

export default Delivery;
