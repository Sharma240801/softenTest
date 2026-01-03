import { Text, View } from "react-native";
import React, { useState } from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button, ScreenWrapper, TextField } from "@/components";
import { ms } from "@/utils";
import { fonts } from "@/theme";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slices/userSlicer";
import { showErrorToast } from "@/components/ToastAlert";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase";
import { auth } from "@/services/firebase";

const Login = () => {
  const { theme } = useUnistyles();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();



  const signIn = async () => {
    if (email.trim() === "") {
      showErrorToast({ title: "Please enter email" });
      return;
    }

    if (password.trim() === "") {
      showErrorToast({ title: "Please enter password" });
      return;
    }

    setLoading(true);

    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign in response:", response);

      dispatch(
        login({
          uid: response.user.uid,
          email: response.user.email,
        })
      );
    } catch (error) {
      console.log("Sign in Error:", error);

      let message = error.message;
      if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password";
      }
      showErrorToast({ title: message });
    } finally {
      setLoading(false);
    }
  };


  const signup = async () => {
    if (email.trim() === "") {
      showErrorToast({ title: "Please enter email" });
      return;
    }

    if (password.trim() === "") {
      showErrorToast({ title: "Please enter password" });
      return;
    }

    setLoading(true);

    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Sign up response:", response);

      dispatch(
        login({
          uid: response.user.uid,
          email: response.user.email,
        })
      );
    } catch (error) {
      console.log("Sign up Error:", error);

      let message = error.message;
      if (error.code === "auth/email-already-in-use") {
        message = "Email is already in use";
      }
      showErrorToast({ title: message });
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScreenWrapper style={styles.container} showLoader={loading}>
      <Text style={styles.title}>Login</Text>
      <View style={{ marginVertical: ms(20) }}>
        <TextField
          placeholder="Enter your email"
          containerStyle={styles.textFieldContainer}
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          placeholder="Enter your password"
          // secureTextEntry
          containerStyle={styles.textFieldContainer}
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {/* <Button
        type="primary"
        title="Sign in"
        style={styles.btnStyle}
        onPress={onPressLogin}
      /> */}
      <Button title="Login" onPress={signIn} />
      <Button title="Signup" onPress={signup} />

    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: ms(20),
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontFamily: fonts.openSan.bold, fontSize: ms(30) },
  textFieldContainer: { width: "100%" },
  btnStyle: { marginTop: ms(20) },
}));
