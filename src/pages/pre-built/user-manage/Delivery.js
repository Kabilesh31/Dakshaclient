import { Alert, Badge, DropdownItem, DropdownMenu, FormGroup, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import axios from "axios";
import { 
  Block, 
  BlockHead, 
  BlockHeadContent, 
  BlockTitle, 
  BlockDes,
  Button,
  Icon,
  DataTable,
  DataTableItem,
  DataTableHead,
  DataTableRow,
  PreviewCard,
  PreviewAltCard,
  TooltipComponent,
} from "../../../components/Component";
import { useForm } from "react-hook-form";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./Delivery.css";

const Delivery = () => {
  const [activeTab, setActiveTab] = useState("route");
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routeAssignments, setRouteAssignments] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [selectedTrackStaff, setSelectedTrackStaff] = useState(null);
  const [showAllStaff, setShowAllStaff] = useState(true);
  
  // Customer data
  const [customers, setCustomers] = useState([
    { 
      _id: "C001", 
      name: "Super Mart", 
      phone: 1234567890, 
      phone2: 1234567891,
      address: "123 Main Street", 
      routeName: "Downtown Loop",
      routeId: "R001",
      lineNo: 1,
      creditDays: 30,
      pincode: 560001,
      geoLocation: { lat: "12.9716", long: "77.5946" },
      category: "Retail",
      status: true
    },
    { 
      _id: "C002", 
      name: "Fresh Grocery", 
      phone: 1234567892, 
      phone2: 1234567893,
      address: "456 Oak Avenue", 
      routeName: "Downtown Loop",
      routeId: "R001",
      lineNo: 2,
      creditDays: 15,
      pincode: 560002,
      geoLocation: { lat: "12.9717", long: "77.5947" },
      category: "Grocery",
      status: true
    },
    { 
      _id: "C003", 
      name: "Tech Gadgets", 
      phone: 1234567894, 
      phone2: 1234567895,
      address: "789 Tech Park", 
      routeName: "North Suburbs",
      routeId: "R002",
      lineNo: 1,
      creditDays: 45,
      pincode: 560003,
      geoLocation: { lat: "12.9718", long: "77.5948" },
      category: "Electronics",
      status: true
    },
    { 
      _id: "C004", 
      name: "Fashion Hub", 
      phone: 1234567896, 
      phone2: 1234567897,
      address: "321 Fashion Street", 
      routeName: "Eastside District",
      routeId: "R003",
      lineNo: 1,
      creditDays: 30,
      pincode: 560004,
      geoLocation: { lat: "12.9719", long: "77.5949" },
      category: "Clothing",
      status: true
    },
    { 
      _id: "C005", 
      name: "Home Decor", 
      phone: 1234567898, 
      phone2: 1234567899,
      address: "654 Design Avenue", 
      routeName: "West Industrial",
      routeId: "R004",
      lineNo: 1,
      creditDays: 60,
      pincode: 560005,
      geoLocation: { lat: "12.9720", long: "77.5950" },
      category: "Home",
      status: true
    },
    { 
      _id: "C006", 
      name: "Book Store", 
      phone: 1234567800, 
      phone2: 1234567801,
      address: "987 Library Road", 
      routeName: "Downtown Loop",
      routeId: "R001",
      lineNo: 3,
      creditDays: 30,
      pincode: 560006,
      geoLocation: { lat: "12.9721", long: "77.5951" },
      category: "Books",
      status: true
    },
  ]);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRouteForAlignment, setSelectedRouteForAlignment] = useState("R001");
  const [isSavingAlignment, setIsSavingAlignment] = useState(false);
  const [assignedRoutes, setAssignedRoutes] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    console.log("Routes state:", routes);
    console.log("Is routes array?", Array.isArray(routes));
    console.log("Route assignments:", routeAssignments);
    console.log("Is routeAssignments array?", Array.isArray(routeAssignments));
  }, [routes, routeAssignments]);

  useEffect(() => {
    fetchStaff();
    fetchRoutes();
  }, []);

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

      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/staff`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, 
          },
        }
      );

      console.log("STAFF API RESPONSE 👉", res.data);

      // Ensure we set an array
      if (Array.isArray(res.data)) {
        setDeliveryStaff(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setDeliveryStaff(res.data.data);
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

      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/route-assignment?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("ROUTES API RESPONSE 👉", res.data);

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

  const fetchAssignedRoutes = async () => {
    try {
      const resAssigned = await axios.get(`/api/routeassign?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Filter only assignments that have a staffId
      const assignedToStaff = resAssigned.data?.filter(a => a.staffId);

      setRouteAssignments(assignedToStaff);
    } catch (err) {
      console.error("Failed to fetch assigned routes:", err);
    }
  };

  const filteredDeliveryStaff = Array.isArray(deliveryStaff) ? deliveryStaff?.filter(
    staff =>
      staff.type?.toLowerCase() === "delivery" &&
      staff.staffStatus === "active" &&
      staff.isDeleted === false
  ) : [];

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

  // Handle staff selection for assignment
  const handleAssignRoute = (staff) => {
    if (!canAssignMoreRoutes(staff._id)) {
      setError(`Cannot assign more routes to ${staff.name}. Maximum 2 routes per day.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSelectedStaff(staff);
    setAssignModal(true);
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

      await axios.delete(
        `${process.env.REACT_APP_BACKENDURL}/api/route-assignment/${selectedAssignmentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      // Remove from state
      setRouteAssignments(prev =>
        Array.isArray(prev) ? prev.filter(a => a._id !== selectedAssignmentId) : []
      );

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

  // Update route status
  const handleUpdateStatus = async (assignmentId, newStatus) => {
    try {
      setRouteAssignments(prev => 
        Array.isArray(prev) 
          ? prev.map(assignment => 
              assignment._id === assignmentId 
                ? { ...assignment, status: newStatus }
                : assignment
            )
          : []
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
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

  // Get customers for selected route
  const getCustomersByRoute = (routeId) => {
    return Array.isArray(customers)
      ? customers
          .filter(customer => customer.routeId === routeId)
          .sort((a, b) => a.lineNo - b.lineNo)
      : [];
  };

  // Handle drag end for customer alignment
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const routeCustomers = getCustomersByRoute(selectedRouteForAlignment);
    const items = Array.from(routeCustomers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update line numbers based on new order
    const updatedCustomers = items.map((customer, index) => ({
      ...customer,
      lineNo: index + 1
    }));

    // Update customers with new order
    setCustomers(prev => 
      Array.isArray(prev)
        ? prev.map(customer => {
            const updatedCustomer = updatedCustomers.find(uc => uc._id === customer._id);
            return updatedCustomer || customer;
          })
        : []
    );
  };

  // Handle save alignment
  const handleSaveAlignment = async () => {
    try {
      setIsSavingAlignment(true);
      
      // Get updated customers for the route
      const updatedRouteCustomers = getCustomersByRoute(selectedRouteForAlignment);
      
      // In a real app, you would make an API call here
      console.log("Saving alignment for route:", selectedRouteForAlignment);
      console.log("Updated customers:", updatedRouteCustomers);
      
      setSuccess("Customer alignment saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving alignment:', error);
      setError('Failed to save alignment');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSavingAlignment(false);
    }
  };

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
                <div className="form-group" style={{ width: '200px' }}>
                  <label className="form-label">Select Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control"
                  />
                </div>
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
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Assigned Routes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredDeliveryStaff) && filteredDeliveryStaff.map((staff) => {
                    const staffAssignments = getStaffAssignedRoutes(staff._id);
                    const canAssign = canAssignMoreRoutes(staff._id);
                    
                    return (
                      <tr key={staff._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="user-avatar bg-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <img
                                  src={staff.img}
                                  alt="profile"
                                  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="fw-bold">{staff.name}</div>
                              <small className="text-muted">{staff.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {staffAssignments?.length > 0 ? (
                            <div>
                              {staffAssignments.map((assignment) => (
                                <div
                                  key={assignment._id}
                                  className="d-flex align-items-center justify-content-between mb-1"
                                >
                                  <div>
                                    <span className="fw-medium">
                                      {assignment.routeId?.routeName || assignment.routeName}
                                    </span>
                                    <Badge className="m-1" color={getStatusBadge(assignment.status)}>
                                      {assignment.status?.replace('_', ' ') || 'ASSIGNED'}
                                    </Badge>
                                  </div>
                                  <Button
                                    size="xs"
                                    color="danger"
                                    className="btn-dim"
                                    onClick={() => openUnassignConfirm(assignment._id)}
                                  >
                                    <Icon name="cross"></Icon>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">No routes assigned</span>
                          )}
                        </td>

                        <td>
                          <Badge
                            color={staffAssignments?.length === 0 ? "light" : "primary"}
                            className="mt-1"
                          >
                            {staffAssignments?.length || 0}/2 Routes
                          </Badge>
                        </td>

                        <td>
                          <div className="d-flex gap-5 align-items-center">
                            {/* Route Select Dropdown */}
                            <div className="form-group mt-4 mr-2" style={{ minWidth: '200px' }}>
                              <select
                                className="form-control"
                                value={staff.selectedRoute || ""}
                                onChange={(e) => {
                                  // store selected route per staff
                                  setDeliveryStaff(prev =>
                                    Array.isArray(prev)
                                      ? prev.map(s =>
                                          s._id === staff._id ? { ...s, selectedRoute: e.target.value } : s
                                        )
                                      : []
                                  );
                                }}
                              >
                                <option value="">Select Route</option>
                                {Array.isArray(getAvailableRoutes()) && getAvailableRoutes().map(route => (
                                  <option key={route._id || route.id} value={route._id || route.id}>
                                    {route.routeName || route.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Assign Button */}
                            <Button
                              color="primary"
                              size="md"
                              disabled={!staff.selectedRoute || !canAssignMoreRoutes(staff._id) || loading}
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  setError(null);

                                  const route = findRoute(staff.selectedRoute);
                                  if (!route) {
                                    setError("Selected route not found");
                                    return;
                                  }

                                  await axios.post(
                                    `${process.env.REACT_APP_BACKENDURL}/api/route-assignment`,
                                    {
                                      date: selectedDate,
                                      staffId: staff._id,
                                      routeId: route._id || route.id,
                                      routeName: route.routeName || route.name,
                                    },
                                    {
                                      headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                      },
                                    }
                                  );

                                  setSuccess(`Route "${route.routeName || route.name}" assigned to ${staff.name}`);
                                  setTimeout(() => setSuccess(null), 3000);

                                  // 🔥 reload assignments from DB
                                  fetchAssignmentsByDate(selectedDate);

                                  // reset dropdown
                                  setDeliveryStaff(prev =>
                                    Array.isArray(prev)
                                      ? prev.map(s =>
                                          s._id === staff._id ? { ...s, selectedRoute: "" } : s
                                        )
                                      : []
                                  );
                                } catch (err) {
                                  setError(err.response?.data?.message || "Failed to assign route");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            >
                              {loading ? "Assigning..." : "Assign"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
      activeDeliveries.some(delivery => delivery.staffId === staff.id)
    );
    
    // Get selected staff's active delivery
    const selectedStaffDelivery = selectedTrackStaff 
      ? activeDeliveries.find(delivery => delivery.staffId === selectedTrackStaff.id)
      : null;
    
    // Mock location data for staff
    const staffLocations = {
      "1": { lat: 12.9716, lng: 77.5946, address: "123 Main St", speed: "25 km/h", lastUpdated: "2 min ago" },
      "2": { lat: 12.9718, lng: 77.5948, address: "456 Oak Ave", speed: "18 km/h", lastUpdated: "5 min ago" },
      "3": { lat: 12.9720, lng: 77.5950, address: "789 Tech Park", speed: "32 km/h", lastUpdated: "Just now" },
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
              <div className="d-flex gap-2 align-items-center">
                <div className="form-group" style={{ width: '200px' }}>
                  <label className="form-label">Select Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              {/* Left Side - Staff Selection */}
              <div className="col-lg-4">
                <div className="card card-bordered h-100">
                  <div className="card-inner">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="title">Active Delivery Staff</h6>
                    </div>
                    
                    <div className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Icon name="search"></Icon>
                        </span>
                        <Input
                          type="text"
                          placeholder="Search staff..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="staff-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      {(showAllStaff ? filteredDeliveryStaff : staffWithActiveDeliveries).map((staff) => {
                        const staffDelivery = activeDeliveries.find(d => d.staffId === staff.id);
                        const isSelected = selectedTrackStaff?.id === staff.id;
                        
                        return (
                          <div 
                            key={staff.id}
                            className={`staff-card mb-3 p-3 border rounded cursor-pointer ${isSelected ? 'selected-staff' : ''}`}
                            onClick={() => setSelectedTrackStaff(staff)}
                            style={{ 
                              cursor: 'pointer',
                              borderColor: isSelected ? '#6576ff' : '#e5e9f2',
                              backgroundColor: isSelected ? 'rgba(101, 118, 255, 0.05)' : 'white'
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <div className="avatar avatar-sm bg-primary me-3 mr-2">
                                  <span>{staff.name?.charAt(0) || 'S'}</span>
                                </div>
                                <div>
                                  <h6 className="mb-0">{staff.name}</h6>
                                  <small className="text-muted">{staff.phone}</small>
                                </div>
                              </div>
                            </div>
                            
                            {staffDelivery && (
                              <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <small className="text-muted">Current Route:</small>
                                    <div className="fw-medium">{staffDelivery.routeName}</div>
                                  </div>
                                  <div className="text-end">
                                    <small className="text-muted">Status:</small>
                                    <div>
                                      <Badge color={getStatusBadge(staffDelivery.status)}>
                                        {staffDelivery.status?.replace('_', ' ') || 'UNKNOWN'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                {staffLocations[staff.id] && (
                                  <div className="mt-2">
                                    <div className="d-flex align-items-center text-muted small">
                                      <Icon name="map-pin" className="me-1"></Icon>
                                      <span>{staffLocations[staff.id].address}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-1">
                                      <small className="text-muted">
                                        <Icon name="clock" className="me-1"></Icon>
                                        {staffLocations[staff.id].lastUpdated}
                                      </small>
                                      <small className="text-muted">
                                        <Icon name="speed" className="me-1"></Icon>
                                        {staffLocations[staff.id].speed}
                                      </small>
                                    </div>
                                  </div>
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

              {/* Right Side - Map View */}
              <div className="col-lg-8">
                <div className="card card-bordered h-100">
                  <div className="card-inner">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="title">
                          {selectedTrackStaff 
                            ? `Tracking: ${selectedTrackStaff.name}`
                            : "Live Map View (All Staff)"
                          }
                          {selectedTrackStaff && selectedStaffDelivery && (
                            <Badge color="primary" className="ms-2">
                              {selectedStaffDelivery.routeName}
                            </Badge>
                          )}
                        </h6>
                        {selectedTrackStaff && staffLocations[selectedTrackStaff.id] && (
                          <p className="text-muted mb-0 small">
                            Last updated: {staffLocations[selectedTrackStaff.id].lastUpdated} • 
                            Speed: {staffLocations[selectedTrackStaff.id].speed}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Map Container */}
                    <div className="map-container bg-light rounded" style={{ height: '500px', position: 'relative' }}>
                      {/* Mock Map with markers */}
                      {/* <div className="w-100 h-100 position-relative">
                        <div className="text-center py-5">
                          <Icon name="map" className="icon-xl text-muted mb-3"></Icon>
                          <p className="text-muted">Map integration would appear here</p>
                          <p className="text-muted small">Google Maps or similar service integration required</p>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delivery Details Table */}
            {selectedTrackStaff && (
              <div className="mt-4">
                <div className="card card-bordered">
                  <div className="card-inner">
                    <h6 className="title">Delivery Details for {selectedTrackStaff.name}</h6>
                    <div className="table-responsive mt-3">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Route</th>
                            <th>Start Time</th>
                            <th>Estimated End</th>
                            <th>Stops Completed</th>
                            <th>Next Stop</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeDeliveries
                            .filter(delivery => delivery.staffId === selectedTrackStaff.id)
                            .map((delivery) => {
                              const route = findRoute(delivery.routeId);
                              return (
                                <tr key={delivery._id}>
                                  <td>
                                    <div className="fw-medium">{delivery.routeName}</div>
                                    <small className="text-muted">{route?.description}</small>
                                  </td>
                                  <td>
                                    {delivery.createdAt 
                                      ? new Date(delivery.createdAt).toLocaleTimeString([], { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })
                                      : 'N/A'
                                    }
                                  </td>
                                  <td>
                                    <div className="fw-medium">12:30 PM</div>
                                    <small className="text-muted">Estimated</small>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                        <div 
                                          className="progress-bar bg-success" 
                                          style={{ width: '65%' }}
                                        ></div>
                                      </div>
                                      <span>4/8</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="fw-medium">Fresh Grocery</div>
                                    <small className="text-muted">456 Oak Ave</small>
                                  </td>
                                  <td>
                                    <Badge color={getStatusBadge(delivery.status)}>
                                      {delivery.status?.replace('_', ' ') || 'UNKNOWN'}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Button size="sm" color="light">
                                      <Icon name="phone"></Icon> Call
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          <p className="mt-3">Loading delivery management data...</p>
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
          
          <Modal isOpen={confirmOpen} toggle={() => setConfirmOpen(false)} centered size="md">
            <ModalBody className="p-5 text-center">
              {/* Icon */}
              <Icon
                name="alert-circle"
                className="text-danger mb-3"
                size="xl"
              />

              {/* Title */}
              <h4 className="mb-2 fw-bold">Unassign Route?</h4>

              {/* Message */}
              <p className="text-muted mb-4">
                This action will remove the route from the staff for this day.
                <br />
                Are you sure you want to continue?
              </p>

              {/* BIG ACTION BUTTONS */}
              <div className="d-flex justify-content-center gap-3">
                <Button
                  color="light"
                  size="lg"
                  className="px-5"
                  onClick={() => setConfirmOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button
                  color="danger"
                  size="lg"
                  className="px-5"
                  onClick={handleUnassignRoute}
                  disabled={loading}
                >
                  {loading ? "Unassigning..." : "Unassign Route"}
                </Button>
              </div>
            </ModalBody>
          </Modal>
        </Block>
      </Content>
    </>
  );
};

export default Delivery;