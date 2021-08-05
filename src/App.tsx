import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "react-native-splash-screen";
import Theme from "./components/Theme";
import Routes from "./components/Routes";
import Boundary from "./components/Boundary";
import ErrorBoundary from "./components/ErrorBoundary";
// import "./Client";
import "./util/i18n";
import Drawer from "./components/Drawer";
import { Platform } from "react-native";

export default function App() {
	const [accessToken, setAccessToken] = useState<string | null>();
	useEffect(() => {
		AsyncStorage.getItem("accessToken").then((x) => setAccessToken(x));
		if (Platform.OS === "android") {
			SplashScreen.hide();
		}
	}, []);

	return (
		<Theme>
			<Boundary>
				<ErrorBoundary>{accessToken ? <Drawer /> : <Routes></Routes>}</ErrorBoundary>
			</Boundary>
		</Theme>
	);
}
