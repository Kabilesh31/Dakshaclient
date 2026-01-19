import {toast } from 'react-toastify';
export const CloseButton = () => {
    return (
      <span className=" mt-1 mr-4 text-xl font-bold" role="button">
        x
      </span>
    );
  };

 export const successToast = (msg) => {
    toast.success(msg, {
      position: "bottom-right",
      autoClose: true,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: false,
      closeButton: <CloseButton />,
    });
  };

 export const warningToast = (msg) => {
    toast.warning(msg, {
      position: "bottom-right",
      autoClose: true,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: false,
      closeButton: <CloseButton />,
    });
  };


 export const errorToast = (msg) => {
    toast.error(msg, {
      position: "bottom-right",
      autoClose: true,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: false,
      closeButton: <CloseButton />,
    });
  };