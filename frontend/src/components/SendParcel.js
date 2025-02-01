import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import "../styles/SendParcel.css";
import axios from "axios";
import SelectLocker from "./SelectLocker";
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
  const [formValid, setFormValid] = useState(false);

  // Add validation effect
  useEffect(() => {
    const isValid =
      Object.values(formData).every((value) => value !== "") && selectedLocker;
    setFormValid(isValid);
  }, [formData, selectedLocker]);

  // Add locker selection handler
  const handleLockerSelect = (lockerId) => {
    setSelectedLocker(lockerId);
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

    // Convert ISO codes to human-readable names
    const countryName =
      countries.find((c) => c.isoCode === formData.country)?.name || "";
    const provinceName =
      provinces.find((p) => p.isoCode === formData.province)?.name || "";
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
      dimensionID: null,
      receiverTrackingID: null,
      riderTrackingID: id + 2,
      lockerID: null,
      compID: null,
      status: "Pending",
      stampid: null,
    };

    try {
      const response = await axios.post(
        "http://localhost:4001/sendParcel",
        requestData
      );
      if (response.data.success) {
        alert("Parcel successfully sent!");
        // Reset all fields including location
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

        <label>Weight (kg):</label>
        <input
          type="number"
          name="parcelWeight"
          value={formData.parcelWeight}
          onChange={handleChange}
          required
        />

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
