import { Text, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useState } from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button, ScreenWrapper, TextField } from "@/components";
import { ms, dotEmailRegex, passwordRegex } from "@/utils";
import { fonts } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slices/userSlicer";
import { showErrorToast } from "@/components/ToastAlert";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";

const Login = () => {
  const { theme } = useUnistyles();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
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

    if (!dotEmailRegex.test(email)) {
      showErrorToast({ title: "Please enter a valid email address" });
      return;
    }

    if (!passwordRegex.test(password)) {
      showErrorToast({
        title: "Weak Password",
        message: "Password must be at least 8 characters, include an uppercase letter, a number, and a special character."
      });
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
    <ScreenWrapper style={styles.container} showLoader={loading} showHeader={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Login</Text>
          <View style={{ marginVertical: ms(20), width: '100%' }}>
            <TextField
              placeholder="Enter your email"
              containerStyle={styles.textFieldContainer}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              placeholder="Enter your password"
              secureTextEntry={secureText}
              containerStyle={styles.textFieldContainer}
              value={password}
              onChangeText={setPassword}
              rightIcon={
                <Feather
                  name={secureText ? "eye" : "eye-off"}
                  size={ms(20)}
                  color={theme.colors.textGray}
                />
              }
              onPressRightIcon={() => setSecureText(!secureText)}
            />
          </View>
          <Button title="Login" onPress={signIn} />
          <Button title="Signup" onPress={signup} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 0, // Let scrollview handle padding or specific needs
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: ms(20),
  },
  title: { fontFamily: fonts.openSan.bold, fontSize: ms(30) },
  textFieldContainer: { width: "100%" },
  btnStyle: { marginTop: ms(20) },
}));
