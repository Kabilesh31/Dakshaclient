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
  fetchStaff();   // your staff fetch
  fetchRoutes();  // load routes
}, []);
useEffect(() => {
  fetchAssignmentsByDate(selectedDate);
}, [selectedDate]);

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

    // Your API returns ARRAY directly
    setDeliveryStaff(res.data);

  } catch (err) {
    console.error("STAFF FETCH ERROR 👉", err);
    setError("Failed to load staff");
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

    setRouteAssignments(res.data || []);
  } catch (err) {
    console.error(err);
    setError("Failed to load route assignments");
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

    // Assuming API returns array in data field
    setRoutes(res.data.data || []);
  } catch (err) {
    console.error("ROUTES FETCH ERROR 👉", err);
    setError("Failed to load routes");
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
    const assignedToStaff = resAssigned.data.filter(a => a.staffId);

    setRouteAssignments(assignedToStaff); // or setAssignedRoutes if you keep that state
  } catch (err) {
    console.error("Failed to fetch assigned routes:", err);
  }
};

useEffect(() => {
  const fetchRoutes = async () => {
    try {
      const resAll = await axios.get("/api/routes"); // all routes
      setRoutes(resAll.data);

      const resAssigned = await axios.get(`/api/routeassign?date=${selectedDate}`);
      setAssignedRoutes(resAssigned.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchRoutes();
}, [selectedDate]);
const filteredDeliveryStaff = deliveryStaff.filter(
  staff =>
    staff.type?.toLowerCase() === "delivery" &&
    staff.staffStatus === "active" &&
    staff.isDeleted === false
);


  // Get routes already assigned to a specific staff member on selected date
const getStaffAssignedRoutes = (staffId) => {
  return routeAssignments.filter(
    assignment =>
      assignment.staffId?._id?.toString() === staffId?.toString() &&
      assignment.date === selectedDate
  );
};


  // Get available routes (not assigned to anyone on selected date)
  const getAvailableRoutes = () => {
  const assignedRouteIds = routeAssignments
    .filter(a => a.date === selectedDate) // keep your date format check
    .map(a => String(a.routeId)); // <- ensure string

  return routes.filter(route => !assignedRouteIds.includes(String(route._id)));
};


  // Check if staff can be assigned more routes (max 2)
  const canAssignMoreRoutes = (staffId) => {
    const staffAssignments = getStaffAssignedRoutes(staffId);
    return staffAssignments.length < 2;
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

    const route = routes.find(r => (r.id || r._id) === data.routeId);

    const isRouteAlreadyAssigned = routeAssignments.some(
      assignment => assignment.routeId === data.routeId && assignment.date === selectedDate
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
      routeName: route.name,
      status: "ASSIGNED",
      createdAt: new Date().toISOString()
    };

    setRouteAssignments(prev => [...prev, newAssignment]);
    setSuccess(`Route "${route.name}" assigned to ${selectedStaff.name} successfully!`);
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

    // ✅ Remove from state (your logic preserved)
    setRouteAssignments(prev =>
      prev.filter(a => a._id !== selectedAssignmentId)
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
      setRouteAssignments(prev => prev.map(assignment => 
        assignment._id === assignmentId 
          ? { ...assignment, status: newStatus }
          : assignment
      ));
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
    return customers
      .filter(customer => customer.routeId === routeId)
      .sort((a, b) => a.lineNo - b.lineNo);
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
      prev.map(customer => {
        const updatedCustomer = updatedCustomers.find(uc => uc._id === customer._id);
        return updatedCustomer || customer;
      })
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
  const renderRouteAssign = () => (
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
              {/* <Button color="primary" size="md" onClick={() => {}} className="mt-4">
                <Icon name="refresh"></Icon>
              </Button> */}
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
                {filteredDeliveryStaff.map((staff) => {
                  const staffAssignments = getStaffAssignedRoutes(staff._id);
                  const canAssign = canAssignMoreRoutes(staff.id);
                  
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
  {staffAssignments.length > 0 ? (
    <div>
      {staffAssignments.map((assignment) => (
        <div
          key={assignment._id}
          className="d-flex align-items-center justify-content-between mb-1"
        >
          <div>
            <span className="fw-medium">
  {assignment.routeId?.routeName}
</span>

            <Badge className="m-1" color={getStatusBadge(assignment.status)}>
              {assignment.status.replace('_', ' ')}
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
                        <span></span>
  <Badge
    color={staffAssignments.length === 0 ? "light" : "primary"}
    className="mt-1"
  >
    {staffAssignments.length}/2 Routes
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
            prev.map(s =>
              s._id === staff._id ? { ...s, selectedRoute: e.target.value } : s
            )
          );
        }}
      >
        <option value="">Select Route</option>
        {getAvailableRoutes().map(route => (
          <option key={route._id} value={route._id}>
            {route.routeName}
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

      const route = routes.find(r => r._id === staff.selectedRoute);
      if (!route) return;

      await axios.post(
        `${process.env.REACT_APP_BACKENDURL}/api/route-assignment`,
        {
          date: selectedDate,
          staffId: staff._id,
          routeId: route._id,
          routeName: route.routeName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccess(`Route "${route.routeName}" assigned to ${staff.name}`);
      setTimeout(() => setSuccess(null), 3000);

      // 🔥 reload assignments from DB
      fetchAssignmentsByDate(selectedDate);

      // reset dropdown
      setDeliveryStaff(prev =>
        prev.map(s =>
          s._id === staff._id ? { ...s, selectedRoute: "" } : s
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign route");
    } finally {
      setLoading(false);
    }
  }}
>
  Assign
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
      {routeAssignments.length > 0 ? (
        <div className="list-group">
         {routeAssignments.map((assignment) => (
  <div
    key={assignment._id}
    className="list-group-item d-flex justify-content-between align-items-center"
  >
    <div>
      <h6 className="mb-1">{assignment.routeId?.routeName}</h6>
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

  // Render Customer Alignment Tab
  const renderCustomerAlignment = () => {
    const routeCustomers = getCustomersByRoute(selectedRouteForAlignment);
    const selectedRoute = routes.find(r => r.id === selectedRouteForAlignment);
    
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
                <div className="form-group" style={{ minWidth: '250px' }}>
                  <label className="form-label">Select Route</label>
                  <select
                    className="form-control"
                    value={selectedRouteForAlignment}
                    onChange={(e) => setSelectedRouteForAlignment(e.target.value)}
                  >
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
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
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="title">
                        {selectedRoute?.name} - Delivery Line Order
                        <Badge color="primary" className="ms-2">
                          {routeCustomers.length} Customers
                        </Badge>
                      </h6>
                      <div className="text-muted">
                        <Icon name="info"></Icon> Drag customers to reorder delivery sequence
                      </div>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="customers">
                        {(provided) => (
                          <div 
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="customer-list"
                          >
                            {routeCustomers.length > 0 ? (
                              routeCustomers.map((customer, index) => (
                                <Draggable 
                                  key={customer._id} 
                                  draggableId={customer._id} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`customer-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                      style={provided.draggableProps.style}
                                    >
                                      <div className="customer-item-content">
                                        <div className="d-flex align-items-center">
                                          <div className="customer-line-number">
                                            <Badge color="primary" pill>
                                              {customer.lineNo}
                                            </Badge>
                                          </div>
                                          <div className="customer-drag-handle ms-3">
                                            <Icon name="menu"></Icon>
                                          </div>
                                          <div className="customer-info ms-3">
                                            <h6 className="mb-1">{customer.name}</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                              <small className="text-muted">
                                                <Icon name="map-pin"></Icon> {customer.address}
                                              </small>
                                              <small className="text-muted">
                                                <Icon name="phone"></Icon> {customer.phone}
                                              </small>
                                              <Badge color="light" className="ms-2">
                                                {customer.category}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="customer-actions">
                                          <Button size="sm" color="light">
                                            <Icon name="eye"></Icon>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <div className="text-center py-5">
                                <Icon name="users" className="icon-xl text-light mb-3"></Icon>
                                <h6>No customers assigned to this route</h6>
                               
                              </div>
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
                    <h6 className="title">Route Information</h6>
                    <div className="mt-3">
                      {selectedRoute && (
                        <div className="p-3 bg-light rounded mb-3">
                          <h5 className="text-primary">{selectedRoute.name}</h5>
                          <p className="text-muted">{selectedRoute.description}</p>
                          <div className="d-flex justify-content-between">
                            <div>
                              <Icon name="map-pin" className="text-primary"></Icon>
                              <span className="ms-2">{selectedRoute.stops} stops</span>
                            </div>
                            <div>
                              <Icon name="clock" className="text-primary"></Icon>
                              <span className="ms-2">{selectedRoute.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
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
                            <Button size="sm" color="light">
                              <Icon name="eye"></Icon>
                            </Button>
                            <Button size="sm" color="light">
                              <Icon name="edit"></Icon>
                            </Button>
                            <Button size="sm" color="light">
                              <Icon name="trash"></Icon>
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
  const [selectedTrackStaff, setSelectedTrackStaff] = useState(null);
  const [showAllStaff, setShowAllStaff] = useState(true);
  
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
                                <span>{staff.name.charAt(0)}</span>
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
                                      {staffDelivery.status.replace('_', ' ')}
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
                    <div className="w-100 h-100 position-relative">
                    </div>
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
                            const route = routes.find(r => r.id === delivery.routeId);
                            return (
                              <tr key={delivery._id}>
                                <td>
                                  <div className="fw-medium">{delivery.routeName}</div>
                                  <small className="text-muted">{route?.description}</small>
                                </td>
                                <td>
                                  {new Date(delivery.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
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
                                    {delivery.status.replace('_', ' ')}
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

        
              <li>
                {/* <button
                  className={`tab-btn ${activeTab === "alignment" ? "active" : ""}`}
                  onClick={() => setActiveTab("alignment")}
                >
                  <Icon name="layers" />
                  <span>Customer Alignment</span>
                </button> */}
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
        {getAvailableRoutes().map(route => (
          <option key={route.id || route._id} value={route.id || route._id}>
            {route.name}
          </option>
        ))}
      </Input>
      {errors.routeId && <span className="text-danger">Route is required</span>}
    </FormGroup>

    <Button color="primary" onClick={handleSubmit(onSubmitAssignment)} disabled={loading}>
      Assign
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