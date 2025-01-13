import AdminParcelManagement from './AdminParcelManagement';
import Dashboard from './DashBoard';
import './App.css';
import AdminHome from './components/AdminHome';
import SelectCompartment from './components/SelectCompartment';
import ManageLockers from './components/adminManageLockers';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router";
import Locker from "./components/Locker";
import LockerList from "./components/LockerList";


function App() {
	return (
		<Router>
			<Routes>
				<Route exact path="/" element={<ManageLockers />} />
				<Route exact path="/LockerList" element={<LockerList />} />
				<Route exact path="/Locker/:id" element={<Locker />} />
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</Router>
	);
}

export default App;
