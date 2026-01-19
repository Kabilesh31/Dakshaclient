import React, { useState } from "react";
import LogoDark from "../../assets/images/kochai-logo.png";
import PageContainer from "../../layout/page-container/PageContainer";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  Col,
  Icon,
  PreviewCard,
} from "../../components/Component";
import { Form, FormGroup, Spinner, Alert, Row } from "reactstrap";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { errorToast, successToast } from "../../utils/toaster";
import SVG from "../../assets/circle.svg"
const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passState, setPassState] = useState(false);
  const [errorVal, setError] = useState("");
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")


  const onFormSubmit = async() => {
    setLoading(true);
    const loginUser = {
      email: email,
      password:password
    }
    const postUser = {
      method: "POST",
      headers: { "content-type" : "application/json"},
      body: JSON.stringify(loginUser)
    }

    try{
      const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/user/login", postUser)
      const resData = await response.json();
      const token = resData.token;
      
      if(!response.ok){
        setLoading(false);
        errorToast(resData.message)
      }
      else {
        successToast("Success")
        localStorage.setItem("accessToken", token);
      setTimeout(() => {
        window.history.pushState(
          `${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "/"}`,
          "auth-login",
          `${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "/"}`
        );
        window.location.reload();
      }, 2000);
    }
  }catch(err){
      console.log(err)
  }

  };

  const { errors, register, handleSubmit } = useForm();

  
  return (
    <React.Fragment>
      <Head title="Login" />
      
      <Row noGutters>
      <Col lg="5" className="d-none d-lg-block" >
              <div
                style={{
                  background: "#ffffff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh", // full page height (optional)
                }}
              >
                <PageContainer>
                  {/* <img
                    className="logo-dark"
                    src={LogoDark}
                    alt="logo-dark"
                    style={{ width: "400px", height: "400px",display: "flex",justifyContent: "center",
                  alignItems: "center", marginLeft:"55px", marginTop:"170px"}} // adjust size
                  /> */}
                </PageContainer>
              </div>
       </Col>
      <Col lg="7">
            <div style={{ backgroundColor: "white"}}>
              <PageContainer>
        <Block  className="nk-block-middle nk-auth-body wide-xs">
          <div className="brand-logo text-center">
          <Link to={process.env.PUBLIC_URL + "/"} className="logo-link">
              {/* <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" /> */}
              
              <h4 style={{ color: "black", fontSize:"30px",marginTop:"10px", marginBottom:"10px",fontFamily: "'Ubuntu', sans-serif" }}>Retail Pulse</h4>
            </Link>
          </div>

          <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
            <BlockHead>
              <BlockContent>
                <BlockTitle tag="h4">Sign-In</BlockTitle>
                {/* <BlockDes>
                  <p>Access Dashlite using your email and passcode.</p>
                </BlockDes> */}
              </BlockContent>
            </BlockHead>
            {errorVal && (
              <div className="mb-3">
                <Alert color="danger" className="alert-icon">
                  {" "}
                  <Icon name="alert-circle" /> Unable to login with credentials{" "}
                </Alert>
              </div>
            )}
            <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
              <FormGroup>
                <div className="form-label-group">
                  <label className="form-label" htmlFor="default-01">
                    Email
                  </label>
                </div>
                <div className="form-control-wrap">
                  <input
                    type="text"
                    onChange={(e)=> setEmail(e.target.value)}
                    id="default-01"
                    name="name"
                    ref={register({ required: "This field is required" })}
                    placeholder="Enter your email address"
                    className="form-control-lg form-control"
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </FormGroup>
              <FormGroup>
                <div className="form-label-group">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <Link  className="link link-primary link-sm" to={`${process.env.PUBLIC_URL}/auth-reset`}>
                   <span style={{color:"#4E56C0"}}>  Forgot Code? </span>
                  </Link>
                </div>
                <div className="form-control-wrap">
                  <a
                    href="#password"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setPassState(!passState);
                    }}
                    className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                  >
                    <Icon name="eye" className="passcode-icon icon-show"></Icon>

                    <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                  </a>
                  <input
                    type={passState ? "text" : "password"}
                    id="password"
                    name="passcode"
                    onChange={(e)=> setPassword(e.target.value)}
                    ref={register({ required: "This field is required" })}
                    placeholder="Enter your password"
                    className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                  />
                  {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
                </div>
              </FormGroup>
              <FormGroup>
                <Button size="lg" className="btn-block" type="submit" style={{backgroundColor:"#4E56C0", color:"white"}}>
                  {loading ? <Spinner size="sm" color="light" /> :<span style={{color:"white"}}>Sign in</span> }
                </Button>
              </FormGroup>
            </Form>
        
          </PreviewCard>
        </Block>
       
      </PageContainer>
      </div>
 
            </Col>
      </Row>
      <AuthFooter />
      
    </React.Fragment>
  );
};
export default Login;
