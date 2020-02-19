import { toast } from 'react-toastify';

const toastSettings = {
  position: toast.POSITION.BOTTOM_RIGHT
};

export default {
  notifyInfo : (msg) => {
    toast(msg, toastSettings);
  },
  notifyError : (error) => {
    toast.error(error, toastSettings)
  },
  notifySuccess : (error) => {
    toast.success(error, toastSettings)
  }
};