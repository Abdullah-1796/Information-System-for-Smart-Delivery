import AdminParcelManagement from './AdminParcelManagement';
import Dashboard from './DashBoard';
import './App.css';
import AdminHome from './components/AdminHome';
import SelectCompartment from './components/SelectCompartment';
import SelectLocker from './components/SelectLocker';

function App() {
	return (
		<div className="App">
			{/* <AdminParcelManagement /> */}
			{/* {<Dashboard/>} */}
			{/* <AdminHome /> */}
			<SelectLocker />
			{/* <SelectCompartment/> */}
		</div>
	);
}

export default App;
