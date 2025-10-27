import SafeAreaScreen from "../src/components/SafeAreaScreen";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <SafeAreaScreen>
      <Slot />
    </SafeAreaScreen>
  );
}
