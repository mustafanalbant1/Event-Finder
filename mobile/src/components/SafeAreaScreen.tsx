import { View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaScreenProps {
  children: React.ReactNode;
}

export default function SafeAreaScreen({ children }: SafeAreaScreenProps) {
  const insets = useSafeAreaInsets();
  return <View style={{ paddingTop: insets.top, flex: 1 }}>{children}</View>;
}
