import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import "../styles/SendParcel.css";
import axios from "axios";
import AvailableLockers from "./AvailableLockers";

const SendParcel = () => {
  const [formData, setFormData] = useState({
    parcelDescription: "",
    parcelWeight: "",
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    city: "",
    province: "",
    country: "",
  });

  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState("");
  const [compID,setCompID]=useState("");
  const [formValid, setFormValid] = useState(false);

  // Add validation effect
  useEffect(() => {
    const isValid =
      Object.values(formData).every((value) => value !== "") && selectedLocker;
    setFormValid(isValid);
  }, [formData, selectedLocker]);

  // Add locker selection handler
  const handleLockerSelect = (lockerId,compID) => {
    setSelectedLocker(lockerId);
    setCompID(compID);
  };

  // Load countries on mount
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Load provinces when country changes
  useEffect(() => {
    if (formData.country) {
      setProvinces(State.getStatesOfCountry(formData.country));
      setFormData((prev) => ({ ...prev, province: "", city: "" }));
    }
  }, [formData.country]);

  // Load cities when province changes
  useEffect(() => {
    if (formData.province && formData.country) {
      setCities(City.getCitiesOfState(formData.country, formData.province));
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.province, formData.country]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const countryName =
      countries.find((c) => c.isoCode === formData.country)?.name || "";
    const provinceName =
      provinces.find((p) => p.isoCode === formData.province)?.name || "";
  
    // Validate required fields
    const requiredFields = [
      { key: "parcelDescription", label: "Parcel Description" },
      { key: "parcelWeight", label: "Parcel Weight" },
      { key: "senderName", label: "Sender Name" },
      { key: "senderPhone", label: "Sender Phone" },
      { key: "senderAddress", label: "Sender Address" },
      { key: "receiverName", label: "Receiver Name" },
      { key: "receiverPhone", label: "Receiver Phone" },
      { key: "receiverAddress", label: "Receiver Address" },
      { key: "city", label: "City" },
      { key: "province", label: "Province" },
      { key: "country", label: "Country" },
    ];
  
    const missingFields = requiredFields
      .filter((field) => !formData[field.key]?.trim()) // Check for empty values
      .map((field) => field.label);
  
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields:\n${missingFields.join("\n")}`);
      return; // Stop form submission
    }
  
    const requestData = {
      lockerid: selectedLocker,
      itemName: formData.parcelDescription,
      sname: formData.senderName,
      sphone: formData.senderPhone,
      semail: "",
      rname: formData.receiverName,
      rphone: formData.receiverPhone,
      remail: "",
      address: formData.receiverAddress,
      city: formData.city,
      province: provinceName,
      country: countryName,
      dimensionID: formData.parcelWeight === "small" ? 1 : formData.parcelWeight === "medium" ? 2 : "large"?3:null,
      receiverTrackingID: null,
      riderTrackingID: id + 2,
      lockerID: selectedLocker,
      compID: compID,
      status: "Pending",
      stampid: null,
    };
  
    try {
      const response = await axios.post("http://localhost:4001/sendParcel", requestData);
      if (response.data.success) {
        alert("Parcel successfully sent!");
        // Reset all fields
        setFormData({
          parcelDescription: "",
          parcelWeight: "",
          senderName: "",
          senderPhone: "",
          senderAddress: "",
          receiverName: "",
          receiverPhone: "",
          receiverAddress: "",
          city: "",
          province: "",
          country: "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending parcel");
    }
  };

  return (
    <div className="container">
      <h2>Parcel Delivery Form</h2>
      <form onSubmit={handleSubmit}>
        {/* LOCATION DETAILS - MODIFIED */}
        <h3>Location Details</h3>
        <label>Country:</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>

        <label>Province:</label>
        <select
          name="province"
          value={formData.province}
          onChange={handleChange}
          required
          disabled={!formData.country}
        >
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province.isoCode} value={province.isoCode}>
              {province.name}
            </option>
          ))}
        </select>

        <label>City:</label>
        <select
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          disabled={!formData.province}
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        {/* PARCEL DETAILS - PRESERVED */}
        <h3>Parcel Details</h3>
        <label>Description:</label>
        <input
          type="text"
          name="parcelDescription"
          value={formData.parcelDescription}
          onChange={handleChange}
          required
        />

        <label>Parcel Size:</label>
        <select
          name="parcelWeight"
          value={formData.parcelWeight}
          onChange={handleChange}
          required
        >
          <option value="">Select Size</option>
          <option value="small">Small (1 to 3kg)</option>
          <option value="medium">Medium (3.1 to 5kg)</option>
          <option value="large">Large (5.1 to 10kg)</option>
        </select>

        {/* SENDER DETAILS - PRESERVED */}
        <h3>Sender Details</h3>
        <label>Name:</label>
        <input
          type="text"
          name="senderName"
          value={formData.senderName}
          onChange={handleChange}
          required
        />

        <label>Phone:</label>
        <input
          type="text"
          name="senderPhone"
          value={formData.senderPhone}
          onChange={handleChange}
          required
        />

        <label>Address:</label>
        <textarea
          name="senderAddress"
          value={formData.senderAddress}
          onChange={handleChange}
          required
        ></textarea>

        {/* RECEIVER DETAILS - PRESERVED */}
        <h3>Receiver Details</h3>
        <label>Name:</label>
        <input
          type="text"
          name="receiverName"
          value={formData.receiverName}
          onChange={handleChange}
          required
        />

        <label>Phone:</label>
        <input
          type="text"
          name="receiverPhone"
          value={formData.receiverPhone}
          onChange={handleChange}
          required
        />

        <label>Address:</label>
        <textarea
          name="receiverAddress"
          value={formData.receiverAddress}
          onChange={handleChange}
          required
        ></textarea>
        <AvailableLockers
          city={formData.city}
          parcelDetails={{
            trackingID: formData.riderTrackingID, // or your generated tracking ID
            parcelWeight: formData.parcelWeight,
          }}
          onLockerSelect={handleLockerSelect}
        />
        <button type="submit" disabled={!formValid || !selectedLocker}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default SendParcel;
