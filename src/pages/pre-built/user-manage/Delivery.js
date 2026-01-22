import { Alert, Badge, DropdownItem, DropdownMenu, FormGroup, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
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
  const [deliveryStaff, setDeliveryStaff] = useState([
    { id: "1", name: "John Smith", email: "john@example.com", phone: "+1 234-567-8901", type: "Delivery", status: "active" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 234-567-8902", type: "Delivery", status: "active" },
    { id: "3", name: "Michael Chen", email: "michael@example.com", phone: "+1 234-567-8903", type: "Delivery", status: "active" },
    { id: "4", name: "Emma Wilson", email: "emma@example.com", phone: "+1 234-567-8904", type: "Delivery", status: "active" },
    { id: "5", name: "Robert Davis", email: "robert@example.com", phone: "+1 234-567-8905", type: "Delivery", status: "active" },
    { id: "6", name: "Lisa Brown", email: "lisa@example.com", phone: "+1 234-567-8906", type: "Office", status: "active" }, // Non-delivery
  ]);
  const [routes, setRoutes] = useState([
    { id: "R001", name: "Downtown Loop", description: "City center delivery route", stops: 8, estimatedTime: "3 hours" },
    { id: "R002", name: "North Suburbs", description: "Residential area deliveries", stops: 12, estimatedTime: "4 hours" },
    { id: "R003", name: "Eastside District", description: "Commercial district route", stops: 6, estimatedTime: "2.5 hours" },
    { id: "R004", name: "West Industrial", description: "Industrial zone deliveries", stops: 10, estimatedTime: "3.5 hours" },
    { id: "R005", name: "South Park", description: "Park area and surroundings", stops: 7, estimatedTime: "3 hours" },
    { id: "R006", name: "Uptown Express", description: "Quick delivery route", stops: 5, estimatedTime: "2 hours" },
  ]);
  const [routeAssignments, setRouteAssignments] = useState([
    { _id: "1", date: "2024-01-22", staffId: "1", routeId: "R001", routeName: "Downtown Loop", status: "ASSIGNED", createdAt: "2024-01-22T09:00:00Z" },
    { _id: "2", date: "2024-01-22", staffId: "2", routeId: "R002", routeName: "North Suburbs", status: "IN_PROGRESS", createdAt: "2024-01-22T09:15:00Z" },
    { _id: "3", date: "2024-01-22", staffId: "3", routeId: "R003", routeName: "Eastside District", status: "COMPLETED", createdAt: "2024-01-22T08:30:00Z" },
  ]);
  
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
  const [assignModal, setAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRouteForAlignment, setSelectedRouteForAlignment] = useState("R001");
  const [isSavingAlignment, setIsSavingAlignment] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Filter delivery staff only
  const filteredDeliveryStaff = deliveryStaff.filter(staff => staff.type === "Delivery");

  // Get routes already assigned to a specific staff member on selected date
  const getStaffAssignedRoutes = (staffId) => {
    return routeAssignments.filter(assignment => 
      assignment.staffId === staffId && assignment.date === selectedDate
    );
  };

  // Get available routes (not assigned to anyone on selected date)
  const getAvailableRoutes = () => {
    const assignedRouteIds = routeAssignments
      .filter(assignment => assignment.date === selectedDate)
      .map(assignment => assignment.routeId);
    
    return routes.filter(route => !assignedRouteIds.includes(route.id));
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
    if (!canAssignMoreRoutes(staff.id)) {
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
      
      const route = routes.find(r => r.id === data.routeId);

      // Check if route is already assigned for this date
      const isRouteAlreadyAssigned = routeAssignments.some(
        assignment => assignment.routeId === data.routeId && assignment.date === selectedDate
      );

      if (isRouteAlreadyAssigned) {
        setError('This route is already assigned for the selected date');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Create new assignment
      const newAssignment = {
        _id: Date.now().toString(),
        date: selectedDate,
        staffId: selectedStaff.id,
        routeId: data.routeId,
        routeName: route.name,
        status: "ASSIGNED",
        createdAt: new Date().toISOString()
      };

      // Add to assignments
      setRouteAssignments(prev => [...prev, newAssignment]);
      setSuccess(`Route "${route.name}" assigned to ${selectedStaff.name} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      setAssignModal(false);
      reset();

    } catch (error) {
      console.error('Error assigning route:', error);
      setError('Failed to assign route');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle route unassignment
  const handleUnassignRoute = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to unassign this route?')) return;

    try {
      setRouteAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId));
      setSuccess('Route unassigned successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error unassigning route:', error);
      setError('Failed to unassign route');
      setTimeout(() => setError(null), 3000);
    }
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
                  const staffAssignments = getStaffAssignedRoutes(staff.id);
                  const canAssign = canAssignMoreRoutes(staff.id);
                  
                  return (
                    <tr key={staff.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar bg-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                            <span style={{ color: 'white', fontWeight: 'bold' }}>{staff.name.charAt(0)}</span>
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
                              <div key={assignment._id} className="d-flex align-items-center justify-content-between mb-1">
                                <div>
                                  <span className="fw-medium">{assignment.routeName}</span>
                                  <Badge className="ms-2" color={getStatusBadge(assignment.status)}>
                                    {assignment.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <Button 
                                  size="xs" 
                                  color="danger" 
                                  className="btn-dim" 
                                  onClick={() => handleUnassignRoute(assignment._id)}
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
                        <Badge color={staffAssignments.length === 0 ? "light" : "primary"}>
                          {staffAssignments.length}/2 Routes
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            style={{padding : "16px"}}
                            color="primary"
                            size="md"
                            onClick={() => handleAssignRoute(staff)}
                            disabled={!canAssign || loading}
                          >
                             Assign Route
                          </Button>
                          {staffAssignments.length > 0 && (
                            <DropdownMenu
                              title={<Icon name="more-h"></Icon>}
                              className="btn-dim btn-outline-light"
                            >
                              {staffAssignments.map((assignment) => (
                                <React.Fragment key={assignment._id}>
                                  <li className="dropdown-header">{assignment.routeName}</li>
                                  {assignment.status !== 'ASSIGNED' && (
                                    <DropdownItem onClick={() => handleUpdateStatus(assignment._id, 'ASSIGNED')}>
                                      <Icon name="clock"></Icon> Mark as Assigned
                                    </DropdownItem>
                                  )}
                                  {assignment.status !== 'IN_PROGRESS' && (
                                    <DropdownItem onClick={() => handleUpdateStatus(assignment._id, 'IN_PROGRESS')}>
                                      <Icon name="play"></Icon> Mark as In Progress
                                    </DropdownItem>
                                  )}
                                  {assignment.status !== 'COMPLETED' && (
                                    <DropdownItem onClick={() => handleUpdateStatus(assignment._id, 'COMPLETED')}>
                                      <Icon name="check"></Icon> Mark as Completed
                                    </DropdownItem>
                                  )}
                                  <div className="dropdown-divider"></div>
                                </React.Fragment>
                              ))}
                            </DropdownMenu>
                          )}
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
          <h5 className="title">Available Routes for {formatDisplayDate(selectedDate)}</h5>
          <div className="mt-4">
            {getAvailableRoutes().length > 0 ? (
              <div className="list-group">
                {getAvailableRoutes().map((route) => (
                  <div key={route.id} className="list-group-item list-group-item-action">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{route.name}</h6>
                        <p className="mb-1 text-muted small">{route.description}</p>
                        <small className="text-muted">
                          <Icon name="map-pin"></Icon> {route.stops} stops • {route.estimatedTime}
                        </small>
                      </div>
                      <Badge color="light">Available</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <Icon name="package" className="icon-xl text-light mb-3"></Icon>
                <p className="text-muted">All routes are assigned for this date</p>
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
                <button
                  className={`tab-btn ${activeTab === "alignment" ? "active" : ""}`}
                  onClick={() => setActiveTab("alignment")}
                >
                  <Icon name="layers" />
                  <span>Customer Alignment</span>
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
            <ModalHeader toggle={() => setAssignModal(false)}>
              Assign Route to {selectedStaff?.name}
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleSubmit(onSubmitAssignment)}>
                <FormGroup>
                  <label className="form-label">Select Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label className="form-label">Select Route</label>
                  <select
                    className="form-control"
                    {...register("routeId", { required: "Please select a route" })}
                  >
                    <option value="">Select a route</option>
                    {getAvailableRoutes().map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name} - {route.description} ({route.stops} stops)
                      </option>
                    ))}
                  </select>
                  {errors.routeId && (
                    <span className="text-danger small">{errors.routeId.message}</span>
                  )}
                </FormGroup>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    color="light"
                    onClick={() => {
                      setAssignModal(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? "Assigning..." : "Assign Route"}
                  </Button>
                </div>
              </form>
            </ModalBody>
          </Modal>
        </Block>
      </Content>
    </>
  );
};

export default Delivery;