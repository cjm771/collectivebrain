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
  },
  getErrorFromGraphQL : (error) => {
    if (typeof error === 'object' && error.graphQLErrors && error.graphQLErrors.length) {
      const result = {
        message: error.graphQLErrors[0].message,
      }
      if (error.graphQLErrors[0].extensions && error.graphQLErrors[0].extensions.exception) {
        if (error.graphQLErrors[0].extensions.exception.invalidArgs) {
          result.fields = error.graphQLErrors[0].extensions.exception.invalidArgs;
        } else if (error.graphQLErrors[0].extensions.exception.errors) {
          result.fields = Object.keys(error.graphQLErrors[0].extensions.exception.errors);
        }
      }
      return result;
    } else if (typeof error === 'object' && error.networkError && error.networkError.result && error.networkError.result.errors && error.networkError.result.errors.length) {
      const tmpResultArr = [];
      const networkError = /(.+)(\{.+\}.*);(.+)/;
      let matches = null;
      for (let rawError of error.networkError.result.errors) {
        matches = null;
        if (matches = networkError.exec(rawError.message)) {
          tmpResultArr.push(matches[3]);
        } else {
          tmpResultArr.push(rawError.message);
        }
      }
      return {message: tmpResultArr.length ? tmpResultArr.join(', ') : error.toString()};
    } else {
      return { message: error.toString() }
    }
  }
};