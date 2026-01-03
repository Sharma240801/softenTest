import Toast from "react-native-toast-message";

interface ToastParams {
  title: string;
  message?: string;
}

export const showSuccessToast = ({ title, message }: ToastParams): void => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
  });
};

export const showErrorToast = ({ title, message }: ToastParams): void => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
};

export const showInfoToast = ({ title, message }: ToastParams): void => {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
  });
};
