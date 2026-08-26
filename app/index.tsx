import { StyleSheet, Text, View } from "react-native";

export default function FoundationPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ankilozanapp</Text>
      <Text style={styles.subtitle}>
        Foundation build in progress. No product screens yet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
});
