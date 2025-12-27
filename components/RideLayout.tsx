import { Platform } from "react-native";

import RideLayoutNative from "./RideLayout.native";
import RideLayoutWeb from "./RideLayout.web";

export default Platform.OS === "web" ? RideLayoutWeb : RideLayoutNative;
