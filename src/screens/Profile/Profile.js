import { Text } from "react-native";
import React from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button, ScreenWrapper } from "@/components";
import { fonts } from "@/theme";
import { ms } from "@/utils";

const Home = () => {
  const { theme } = useUnistyles();

  return (
    <ScreenWrapper style={styles.container}>
      <Text style={styles.title}>Profile</Text>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: ms(20),
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontFamily: fonts.openSan.bold, fontSize: ms(30) },
  btnStyle: { marginTop: ms(40) },
}));
