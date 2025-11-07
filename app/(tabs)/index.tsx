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
      <Link href="./properties/1" className="text-red-500 text-2xl">Book 1</Link>
      <Link href="/explore" className="text-blue-500 text-2xl">Explore</Link>
      <Link href="/library" className="text-green-500 text-2xl">Library</Link>
      <Link href="/profile" className="text-purple-500 text-2xl">Profile</Link>
      <Link href="/login" className="text-yellow-500 text-2xl">Login</Link>
      <Link href="/register" className="text-orange-500 text-2xl">Register</Link>
    </View>
  );
}
