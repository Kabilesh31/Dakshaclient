  import { Alert, Badge, DropdownItem, DropdownMenu, FormGroup, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
  import React, { useState, useEffect } from "react";
  import { successToast, errorToast, warningToast } from "../../../utils/toaster";
  import Content from "../../../layout/content/Content";
  import Head from "../../../layout/head/Head";
  import CustomerLiveMap from "./delivery/CustomerLiveMap";
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

  const Delivery = () => {
    const [activeTab, setActiveTab] = useState("alignment");
    const [deliveryStaff, setDeliveryStaff] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [routeAssignments, setRouteAssignments] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [selectedTrackStaff, setSelectedTrackStaff] = useState(null);
    const [showAllStaff, setShowAllStaff] = useState(true);
    const [selectedRouteForAlignment, setSelectedRouteForAlignment] = useState("");
    const [customers, setCustomers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
    const [bills, setBills] = useState([]);
    
    const fetchCustomersByAssignedStaff = async() => {
      try{
        const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/route-assignment/${selectedStaffId}/assignedCustomer`)
        if(response.status === 200) {
          setAssignedCustomerDatas(response.data.customers)
          console.log(response.data.customers)
        }
      }catch(err){
        console.log(err)
      }
    }

    useEffect(() => {
      fetchStaff();
      fetchRoutes();
      fetchCustomers();
      fetchBills()
    }, []);

    const fetchBills = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/bills`);
        if (response.status === 200) {
          // Store bills in state
          setBills(response.data.bills || []);
        }
      } catch (err) {
        console.log(err);
        setBills([]);
      }
    };

    const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const last3DaysBills = bills.filter((bill) => {
        return new Date(bill.createdAt) >= threeDaysAgo;
    });

    const filterAssignedCustomer = assinedCustomerDatas.filter((customer) =>
      last3DaysBills.some(
        (bill) => bill.customerId.toString() === customer._id.toString()
      )
    );
    
  useEffect(() => {
    const loadAssignedCustomers = async () => {
      if (!selectedStaffId) {
        setAssignedCustomerDatas([]);
        return;
      }
      
      const staffAssignments = routeAssignments.filter(
        (assignment) =>
          assignment.staffId?._id?.toString() === selectedStaffId.toString() &&
          assignment.date === selectedDate
      );

      if (staffAssignments.length === 0) {
        setAssignedCustomerDatas([]);
        return;
      }

      // If assigned → fetch customers
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKENDURL}/api/route-assignment/${selectedStaffId}/assignedCustomer`
        );
        console.log(response.data.customers)
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
          `${process.env.REACT_APP_BACKENDURL}/api/location/latest/${selectedTrackStaff._id}`
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

        if (Array.isArray(res.data)) {
          const datas = res.data
          const filteredStaffDatas = datas.filter((item)=> item.type === "delivery")

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
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/customer`);
      setCustomers(res.data.filter(c => !c.isDeleted && c.status));
    } catch (err) {
      console.error(err);
      errorToast("Failed to fetch customers");
    }
  };


  const filteredDeliveryStaff = Array.isArray(deliveryStaff)
    ? deliveryStaff.filter(
        (staff) =>
          staff.staffStatus === "active" &&
          staff.dutyStatus === "active" &&   // 👈 IMPORTANT
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

      const routeId = selectedRouteForAlignment;

      // ✅ Only customers of selected route
      const customersToUpdate = customers
        .filter(c => String(c.routeId) === String(routeId))
        .map((c, index) => ({
          _id: c._id,
          lineNo: index + 1
        }));

      // ✅ SEND CORRECT PAYLOAD
  const res = await axios.put(
    `${process.env.REACT_APP_BACKENDURL}/api/delivery/update-line-order`,
    {
      routeId,
      customers: customersToUpdate   // ✅ THIS IS THE FIX
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
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
      // errorToast(err.response?.data?.error || "Save failed");
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
    (customer) => customer.orderPending === true
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
                    Refresh
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
                  <div className="form-group" style={{ minWidth: '250px' }}>
                    <label className="form-label">Select Route</label>
                  <select
    className="form-control"
    value={selectedRouteForAlignment}
    onChange={(e) => setSelectedRouteForAlignment(e.target.value)}
  >
    <option value="">Select Route</option>
    {routes.map(route => (
      <option key={route._id} value={route._id}>
    {route.routeName}
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

                            <Badge color="primary" pill>
                              {customer.lineNo}
                            </Badge>

                            <div className="ms-3 ml-3">
                              <strong>{customer.name}</strong>
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
                              <Button
                                size="sm"
                                color="light"
                                onClick={() => handleViewCustomer(customer)}
                              >
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
      )

      );
      
      const selectedStaffDelivery = selectedTrackStaff
    ? activeDeliveries.find(delivery =>
        String(delivery.staffId?._id || delivery.staffId) ===
        String(selectedTrackStaff._id)
      )
    : null;

  const liveRouteCustomers = selectedTrackStaff && selectedStaffDelivery
    ? customers.filter(
        (c) =>
          String(c.routeId) ===
          String(
            selectedStaffDelivery.routeId?._id ||
            selectedStaffDelivery.routeId ||
            selectedStaffDelivery.routeName
          )
      )
    : [];

  const totalCustomers = filterAssignedCustomer?.length || 0;

  const completedCustomers =
  filterAssignedCustomer?.filter(
    (c) => c.orderPending === false
  ).length || 0;


  const isRouteCompleted =
  totalCustomers > 0 && completedCustomers === totalCustomers;

  
  const getCustomerStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "text-success";   // Delivered
      case "current":
        return "text-primary";   // Arriving
      case "upcoming":
        return "text-warning";   // Expected
      default:
        return "text-muted";
    }
  };
  const getRailIcon = (status) => {
    if (status === "completed") {
      return <Icon name="check-circle-fill" className="text-success" />;
    }

    if (status === "current") {
      return selectedTrackStaff?.type === "delivery" ? (
        <Icon name="truck" className="text-primary" />
      ) : (
        <Icon name="truck" className="text-primary" />
      );
    }

    return <Icon name="clock" className="text-muted" />;
  };
    const handleRefresh = () => {
      fetchCustomersByAssignedStaff()
      fetchCustomers()
      fetchStaff()
    };
      return (
        <div className="row g-4">
          <div className="col-12">
            <PreviewCard>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="title">Live Delivery Tracking</h5>
                  <p className="text-soft mb-0">
                    Track deliveries in real-time on the map
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
                    Refresh
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
                                setSelectedTrackStaff(staff);
                                setSelectedStaffId(staff._id)
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
                        ).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  <CustomerLiveMap
                    staff={selectedTrackStaff ? { ...selectedTrackStaff, location: liveLocation } : null}
                    customers={filterAssignedCustomer}
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
                          {selectedTrackStaff?.type === "delivery" ? "🚚" : "🏍️"}
                        </span>

                        {selectedTrackStaff?.type === "delivery"
                          ? "Delivery Vehicle"
                          : "Sales Vehicle"}{" "}
                        – Route #{selectedStaffDelivery?.routeCode || "DL-204"}
                      </h6>

                      {/* SECOND LINE */}
                      <div className="mt-1">
                        <Badge
                    color={isRouteCompleted ? "success" : "primary"}
                    className="fs-11"
                  >
                    Status : {isRouteCompleted ? "Completed" : "Running"}
                  </Badge>

                      </div>
                    </div>



                      <small className="text-muted">
                        Started 08:30 • ETA 12:30 • 65 km
                      </small>
                    </div>

                    {/* RAIL STATUS */}
                

                    <div className="rail-status">
                      {/* START POINT */}
                      <div className="rail-row completed">
                        <div className="rail-left">
                          <div className="rail-dot"></div>
                          <div className="rail-line"></div>
                        </div>
                        <div className="rail-content">
                          <div className="d-flex justify-content-between">
                            <strong>Central Warehouse</strong>
                            <span className="time">08:30</span>
                          </div>
                          <small className="text-muted">
                            Trip Started • 0 km
                          </small>
                        </div>
                      </div>
                    
                      {/* CUSTOMERS */}
                      {filterAssignedCustomer
                        .sort((a, b) => a.lineNo - b.lineNo)
                        .map((customer, index) => {
                          const isActiveCustomer =
                                selectedCustomerForMap?._id === customer._id;
                                                    let rowStatus = "upcoming";

                            if (customer.orderPending === false) {
                              rowStatus = "completed";
                            } else if (customer.orderPending === true) {
                              const hasPreviousPending = assinedCustomerDatas
                                .sort((a, b) => a.lineNo - b.lineNo)
                                .some(
                                  (c) =>
                                    c.lineNo < customer.lineNo &&
                                    c.orderPending === true
                                );

                              if (!hasPreviousPending) {
                                rowStatus = "current";
                              }
                            }

                          return (
                            <div
                              className={`rail-row ${rowStatus} ${isActiveCustomer ? "active-customer" : ""}`}
                              key={customer._id}
                              onClick={() => setSelectedCustomerForMap(customer)}
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
                                  <strong>{customer.name}</strong>
                                  <span className={`time ${getCustomerStatusClass(rowStatus)}`}>
                                    {rowStatus === "completed" && "Delivered"}
                                    {rowStatus === "current" && "Arriving"}
                                    {rowStatus === "upcoming" && "Expected"}
                                  </span>
                                </div>

                                <small
                                  className={
                                    rowStatus === "current" ? "text-primary" : "text-muted"
                                  }
                                >
                                  Line No: {customer.lineNo} • {customer.routeName}
                                </small>
                              </div>
                            </div>
                          );
                        })}

                      {/* END POINT */}
                        

                      <div className={`rail-row ${isRouteCompleted ? "completed" : "upcoming"}`}>
                        <div className="rail-left">
                          <div className="rail-dot"></div>
                        </div>
                        <div className="rail-content">
                          <div className="d-flex justify-content-between">
                            <strong>Route End (Warehouse)</strong>
                            <span className="time">12:30</span>
                          </div>
                          <small className="text-muted">
                            Trip Completion
                          </small>
                        </div>
                      </div>
                      {isRouteCompleted && (
                        <div className="alert alert-success py-2 mb-3">
                          🎉 All Customers Delivered – Route Completed Successfully
                        </div>
                      )}
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

export default Delivery;