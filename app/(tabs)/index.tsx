import { Link } from "expo-router";
import { View } from "react-native";

export default function Index() {
  return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link href="./books/1" className="text-text-dark text-2xl font-lora">Book 1</Link>
        <Link href="/explore" className="text-text-light text-2xl font-lora">Explore</Link>
        <Link href="/library" className="text-primary text-2xl font-lora">Library</Link>
        <Link href="/profile" className="text-secondary text-2xl font-lora">Profile</Link>
        <Link href="/login" className="text-text-light text-2xl font-lora">Login</Link>
        <Link href="/register" className="text-text-light text-2xl font-lora">Register</Link>
      </View>
  );
}
