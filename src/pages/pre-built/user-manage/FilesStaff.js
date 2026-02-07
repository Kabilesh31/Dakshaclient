import React, { useEffect, useState } from "react";
import Head from "../../../layout/head/Head";
import {
  BlockBetween,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  InputSwitch,
  Button,
} from "../../../components/Component";
import { fileManagerIconData } from "../../components/crafted-icons/NioIconData";
import { Row, Col, Modal, ModalBody } from "reactstrap";
import Dropzone from "react-dropzone";
import axios from "axios";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const bufferToUint8Array = (buffer) => {
  return new Uint8Array(buffer);
};

const FilesStaff = ({ sm, updateSm }) => {
  const [files, setFiles] = useState([]);
  const [assignModal, setAssignModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [driveData, setDriveData] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [iframeSrc, setIframeSrc] = useState(null);
  const toggleAssignModal = () => {
    setAssignModal(!assignModal);
  };
  const toggleViewModal = () => setViewModal(!viewModal);
  const { id } = useParams();

  useEffect(() => {
    if (driveData?.length === 0) {
      fetchDriveData();
    }
  }, [driveData]);

  const fetchDriveData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/driveFiles");
      setDriveData(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const filterDriveData = driveData.filter((item) => item.staffId === id);

  // SVG
  const pdfSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <path fill="#f26b6b" d="M50 61H22a6 6 0 01-6-6V22l9-11h25a6 6 0 016 6v38a6 6 0 01-6 6z"></path>
      <path fill="#f4c9c9" d="M25 20.556A1.444 1.444 0 0123.556 22H16l9-11z"></path>
      <path
        fill="#fff"
        d="M46.334 44.538a4.326 4.326 0 00-2.528-1.429 22.436 22.436 0 00-4.561-.383 19.356 19.356 0 01-3.425-4.772 56.508 56.508 0 001.375-6.086 2.339 2.339 0 00-.462-1.845 1.943 1.943 0 00-1.516-.753h-.001a1.685 1.685 0 00-1.39.697c-1.149 1.526-.363 5.219-.194 5.946a12.612 12.612 0 00.724 2.147 33.322 33.322 0 01-2.49 6.106 20.347 20.347 0 00-5.979 3.44 2.568 2.568 0 00-.886 1.827 1.802 1.802 0 00.634 1.306 2.061 2.061 0 001.395.531 2.244 2.244 0 001.459-.546 20.068 20.068 0 004.29-5.357 20.838 20.838 0 015.938-1.186 33.75 33.75 0 004.243 3.605 2.64 2.64 0 003.416-.236 2.08 2.08 0 00-.042-3.012zM27.62 49.623a.834.834 0 01-1.084.042.42.42 0 01-.167-.27c-.002-.066.027-.315.44-.736a18.038 18.038 0 013.762-2.368 17.26 17.26 0 01-2.95 3.332zm7.283-18.775a.343.343 0 01.315-.151.6.6 0 01.465.239.853.853 0 01.168.672c-.164.92-.424 2.38-.852 4.117l-.037-.151c-.356-1.523-.609-3.996-.059-4.726zm-1.179 12.703a34.973 34.973 0 001.52-3.767 21.248 21.248 0 002.224 3.05 21.857 21.857 0 00-3.744.717zm11.706 2.97a1.308 1.308 0 01-1.695.088 33.203 33.203 0 01-3.004-2.43 20.968 20.968 0 012.835.334 2.97 2.97 0 011.74.965c.533.633.296.87.123 1.043z"
      ></path>
    </svg>
  );

  const pptSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <path fill="#f25168" d="M50 61H22a6 6 0 01-6-6V22l9-11h25a6 6 0 016 6v38a6 6 0 01-6 6z"></path>
      <path fill="#ff9fb6" d="M25 20.556A1.444 1.444 0 0123.556 22H16l9-11z"></path>
      <path
        fill="#fff"
        d="M44.14 46H27.86A1.86 1.86 0 0126 44.14v-9.28A1.86 1.86 0 0127.86 33h16.28A1.86 1.86 0 0146 34.86v9.28A1.86 1.86 0 0144.14 46zm-14.995-2h13.71A1.145 1.145 0 0044 42.855v-6.71A1.145 1.145 0 0042.855 35h-13.71A1.145 1.145 0 0028 36.145v6.71A1.145 1.145 0 0029.145 44z"
      ></path>
      <path
        fill="#fff"
        d="M36.422 34.268a.711.711 0 01-.505-.21l-2.143-2.142a.714.714 0 011.01-1.01l2.143 2.143a.714.714 0 01-.505 1.22z"
      ></path>
      <path
        fill="#fff"
        d="M36.422 34.268a.714.714 0 01-.505-1.22l2.143-2.142a.714.714 0 011.01 1.01l-2.143 2.143a.711.711 0 01-.505.209zM32.136 49.268a.705.705 0 01-.367-.102.715.715 0 01-.245-.98l2.143-3.571a.714.714 0 011.225.735l-2.143 3.57a.714.714 0 01-.613.348zM40.708 49.268a.714.714 0 01-.613-.346l-2.142-3.572a.714.714 0 011.225-.735l2.142 3.572a.714.714 0 01-.612 1.081zM35.12 37H30.9a.5.5 0 110-1h4.22a.5.5 0 110 1zM41.976 43h-4.429a.506.506 0 110-1.006h4.429a.506.506 0 110 1.006zM38.14 40h-4.163a.5.5 0 110-1h4.163a.5.5 0 110 1z"
      ></path>
    </svg>
  );
  const xlSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <path fill="#36c684" d="M50 61H22a6 6 0 01-6-6V22l9-11h25a6 6 0 016 6v38a6 6 0 01-6 6z"></path>
      <path fill="#95e5bd" d="M25 20.556A1.444 1.444 0 0123.556 22H16l9-11z"></path>
      <path
        fill="#fff"
        d="M42 31H30a3.003 3.003 0 00-3 3v11a3.003 3.003 0 003 3h12a3.003 3.003 0 003-3V34a3.003 3.003 0 00-3-3zm-13 7h6v3h-6zm8 0h6v3h-6zm6-4v2h-6v-3h5a1.001 1.001 0 011 1zm-13-1h5v3h-6v-2a1.001 1.001 0 011-1zm-1 12v-2h6v3h-5a1.001 1.001 0 01-1-1zm13 1h-5v-3h6v2a1.001 1.001 0 01-1 1z"
      ></path>
    </svg>
  );

  const wordSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <path fill="#7e95c4" d="M50 61H22a6 6 0 01-6-6V22l9-11h25a6 6 0 016 6v38a6 6 0 01-6 6z"></path>
      <path fill="#b7ccea" d="M25 20.556A1.444 1.444 0 0123.556 22H16l9-11z"></path>
      <rect width="18" height="2" x="27" y="31" fill="#fff" rx="1" ry="1"></rect>
      <rect width="18" height="2" x="27" y="35" fill="#fff" rx="1" ry="1"></rect>
      <rect width="18" height="2" x="27" y="39" fill="#fff" rx="1" ry="1"></rect>
      <rect width="14" height="2" x="27" y="43" fill="#fff" rx="1" ry="1"></rect>
      <rect width="8" height="2" x="27" y="47" fill="#fff" rx="1" ry="1"></rect>
    </svg>
  );

  const zipSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <rect width="40" height="44" x="16" y="14" fill="#7e95c4" rx="6" ry="6"></rect>
      <rect width="8" height="2" x="32" y="17" fill="#fff" rx="1" ry="1"></rect>
      <rect width="8" height="2" x="32" y="22" fill="#fff" rx="1" ry="1"></rect>
      <rect width="8" height="2" x="32" y="27" fill="#fff" rx="1" ry="1"></rect>
      <rect width="8" height="2" x="32" y="32" fill="#fff" rx="1" ry="1"></rect>
      <rect width="8" height="2" x="32" y="37" fill="#fff" rx="1" ry="1"></rect>
      <path fill="#fff" d="M35 14h2v29a1 1 0 01-1 1 1 1 0 01-1-1V14z"></path>
      <path
        fill="#fff"
        d="M38.002 42h-4.004A1.998 1.998 0 0032 43.998v2.004A1.998 1.998 0 0033.998 48h4.004A1.998 1.998 0 0040 46.002v-2.004A1.998 1.998 0 0038.002 42zm-.005 4H34v-2h4z"
      ></path>
    </svg>
  );
  // upload File

  const handleDropChange = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      name: file.name,
      type: file.type,
      file: file,
      preview: URL.createObjectURL(file),
    }));
    setFiles(newFiles);
    setUploadedFile(newFiles[0]);
  };

  const handleUpload = () => {
    if (!uploadedFile) {
      warningToast("No file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile.file);
    formData.append("fileType", uploadedFile.type);
    formData.append("userId", id);

    const uploadUrl = `${process.env.REACT_APP_BACKENDURL}/api/driveUpload`;

    axios
      .post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        toggleAssignModal();
        fetchDriveData();
        successToast("File uploaded successfully:", response.data);
        setFiles([]);
        setUploadedFile(null);
      })
      .catch((error) => {
        errorToast("File upload failed.");
      });
  };

  const openFileInModal = (item) => {
    try {
      const isBase64 = (data) => {
        const base64Regex = /^[A-Za-z0-9+/=]+$/;
        return base64Regex.test(data);
      };

      let binaryData;
      if (isBase64(item.data)) {
        binaryData = atob(item.data);
      } else {
        binaryData = new TextDecoder().decode(item.data);
      }

      const uint8Array = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }

      const blob = new Blob([uint8Array], { type: item.contentType });
      const url = window.URL.createObjectURL(blob);

      if (
        item.contentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        item.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        item.contentType === "application/msword"
      ) {
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = item.filename || "file";
        downloadLink.click();
      } else if (item.contentType === "application/pdf") {
        setIframeSrc(url);
        toggleViewModal();
      } else {
        console.warn("Unsupported file type:", item.contentType);
      }
    } catch (error) {
      console.error("Failed to open file in modal", error);
    }
  };

  return (
    <React.Fragment>
      <Head title="File Manager"></Head>

      <BlockHead size="lg">
        <BlockBetween>
          <BlockHeadContent>
            {/* <BlockTitle tag="h4">Drive</BlockTitle> */}
            <div style={{ position: "absolute", right: 0 }}>
              <Button color="primary" className="btn-icon" onClick={toggleAssignModal}>
                <Icon name="upload"></Icon>
              </Button>
            </div>
            {/* <BlockDes>
              <p>You will get only notification what have enabled.</p>
            </BlockDes> */}
          </BlockHeadContent>
          <BlockHeadContent className="align-self-start d-lg-none">
            <Button
              className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
              onClick={() => updateSm(!sm)}
            >
              <Icon name="menu-alt-r"></Icon>
            </Button>
          </BlockHeadContent>
        </BlockBetween>
      </BlockHead>

      <BlockContent>
        <Row className="row g-gs preview-icon-svg">
          {filterDriveData?.length > 0 ? (
            filterDriveData.map((item, idx) => {
              let icon;

              switch (item.contentType) {
                case "application/pdf":
                  icon = pdfSVG;
                  break;
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": // Word
                  icon = wordSVG;
                  break;
                case "application/vnd.openxmlformats-officedocument.presentationml.presentation": // PowerPoint
                  icon = pptSVG;
                  break;
                case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": // Excel
                  icon = xlSVG;
                  break;
                case "application/zip": // Zip
                  icon = zipSVG;
                  break;
                default:
                  icon = null; // or a default icon if needed
              }

              return (
                <Col lg="2" sm="4" md="6" key={idx}>
                  <div
                    style={{ cursor: "pointer", height: "160px", padding: "10px", marginTop: "50px" }}
                    onClick={() => openFileInModal(item)}
                    className="preview-icon-box card card-bordered"
                  >
                    <div className="preview-icon-wrap">{icon}</div>
                    <span className="preview-icon-name">{item.filename}</span>
                  </div>
                </Col>
              );
            })
          ) : (
            <div
              style={{ position: "absolute", right: "50%", bottom: "35%", alignItems: "center", textAlign: "center" }}
            >
              <span>No files uploaded</span>
            </div>
          )}
        </Row>
      </BlockContent>

      <Modal isOpen={assignModal} toggle={toggleAssignModal} className="modal-dialog-centered" size="md">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              toggleAssignModal();
            }}
            className="close"
          >
            <Icon onClick={toggleAssignModal} name="cross-sm"></Icon>
          </a>

          <div className="nk-modal-head ">
            <h4 className="nk-modal-title title">Upload Files</h4>
            <div className="card-inner-group">
              <div className="card-inner p-0">
                <Dropzone
                  accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/zip"
                  multiple={false}
                  onDrop={(acceptedFiles) => handleDropChange(acceptedFiles, setFiles)}
                  maxSize={10485760}
                >
                  {({ getRootProps, getInputProps }) => (
                    <section>
                      <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                        <input {...getInputProps()} />
                        {files.length === 0 && (
                          <div className="dz-message">
                            <span className="dz-message-text">Drag and drop file</span>
                            <span className="dz-message-or">or</span>
                            <Button color="primary">SELECT</Button>
                          </div>
                        )}
                        {files.map((file) => (
                          <div
                            key={file.name}
                            className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                          >
                            <div className="dz-image">
                              {/* <img src={file.preview} alt="preview" /> */}
                              <iframe
                                src={file.preview}
                                name="iframe_a"
                                height="600px"
                                width="100%"
                                title="Iframe Example"
                              ></iframe>
                            </div>
                            <div style={{ marginTop: "20px" }}>
                              <span>{file.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </Dropzone>
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "end" }}>
                  <Button onClick={handleUpload} color="primary">
                    {" "}
                    Upload{" "}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={viewModal} toggle={toggleViewModal} className="modal-dialog-centered" size="lg">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              toggleViewModal();
            }}
            className="close"
          >
            <Icon name="cross-sm" />
          </a>
          <iframe src={iframeSrc} style={{ width: "100%", height: "80vh" }} title="File Viewer"></iframe>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};
export default FilesStaff;
