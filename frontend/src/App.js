import './App.css';
import AdminHome from './components/AdminHome';
import ManageLockers from './components/adminManageLockers';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router";
import Locker from "./components/Locker";
import LockerList from "./components/LockerList";
import SelectLocker from './components/SelectLocker';
import RiderHome from './components/RiderHome';
import ParcelDeliveryDetail from './components/ParcelDeliveryDetail';
import ParcelReceivingDetail from './components/ParcelReceivingDetail';

function App() {
	return (
		<Router>
			<Routes>
				<Route exact path="/" element={<ManageLockers />} />
				<Route exact path="/LockerList" element={<LockerList />} />
				<Route exact path="/Locker/:id" element={<Locker />} />
				<Route exact path="/AdminHome" element={<AdminHome />} />
				<Route exact path="/SelectLocker" element={<SelectLocker />} />
				<Route exact path="/RiderHome" element={<RiderHome />} />
				<Route exact path="/ParcelDeliveryDetail" element={<ParcelDeliveryDetail />} />
				<Route exact path="/ParcelReceivingDetail" element={<ParcelReceivingDetail />} />
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</Router>
	);
}

export default App;
