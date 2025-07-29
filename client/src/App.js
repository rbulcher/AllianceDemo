import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { ROUTES } from "./utils/constants";
import DisplayView from "./components/DisplayView/DisplayView";
import ControllerView from "./components/ControllerView/ControllerView";
import AdminPanel from "./components/Admin/AdminPanel";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import "./App.css";

function App() {
	return (
		<ErrorBoundary>
			<Router>
				<div className="App">
					<Routes>
						<Route
							path={ROUTES.HOME}
							element={<Navigate to={ROUTES.CONTROLLER} replace />}
						/>
						<Route path={ROUTES.CONTROLLER} element={<ControllerView />} />
						<Route path={ROUTES.DISPLAY} element={<DisplayView />} />
						<Route path={ROUTES.ADMIN} element={<AdminPanel />} />
						{/* Redirect old scenario select route to controller */}
						<Route
							path={ROUTES.SCENARIO_SELECT}
							element={<Navigate to={ROUTES.CONTROLLER} replace />}
						/>
					</Routes>
				</div>
			</Router>
		</ErrorBoundary>
	);
}

export default App;
