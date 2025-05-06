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
  const [compID, setCompID] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [activeSection, setActiveSection] = useState("location"); // For multi-step form
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add validation effect
  useEffect(() => {
    const isValid =
      Object.values(formData).every((value) => value !== "") && selectedLocker;
    setFormValid(isValid);
  }, [formData, selectedLocker]);

  // Add locker selection handler
  const handleLockerSelect = (lockerId, compID) => {
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
    setIsSubmitting(true);
    
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
      .filter((field) => !formData[field.key]?.trim())
      .map((field) => field.label);
  
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields:\n${missingFields.join("\n")}`);
      setIsSubmitting(false);
      return;
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
      status: "selectionDone",
    };
  
    try {
      const response = await axios.post("http://localhost:4001/sendParcel", requestData);
      if (response.data.success) {
        alert("Parcel successfully sent!");
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
        setSelectedLocker("");
        setActiveSection("location");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending parcel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSection = () => {
    if (activeSection === "location" && formData.country && formData.province && formData.city) {
      setActiveSection("parcel");
    } else if (activeSection === "parcel" && formData.parcelDescription && formData.parcelWeight) {
      setActiveSection("sender");
    } else if (activeSection === "sender" && formData.senderName && formData.senderPhone && formData.senderAddress) {
      setActiveSection("receiver");
    } else {
      alert("Please complete all fields in the current section before proceeding.");
    }
  };

  const prevSection = () => {
    if (activeSection === "parcel") setActiveSection("location");
    else if (activeSection === "sender") setActiveSection("parcel");
    else if (activeSection === "receiver") setActiveSection("sender");
  };

  return (
    <div className="main-container">
      <div className="form-container">
        <h2 className="form-title">Parcel Delivery</h2>
        
        {/* Progress indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${activeSection === "location" ? "active" : ""}`}>
            <span>1</span>
            <p>Location</p>
          </div>
          <div className={`progress-step ${activeSection === "parcel" ? "active" : ""}`}>
            <span>2</span>
            <p>Parcel</p>
          </div>
          <div className={`progress-step ${activeSection === "sender" ? "active" : ""}`}>
            <span>3</span>
            <p>Sender</p>
          </div>
          <div className={`progress-step ${activeSection === "receiver" ? "active" : ""}`}>
            <span>4</span>
            <p>Receiver</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* LOCATION DETAILS */}
          <div className={`form-section ${activeSection === "location" ? "active" : ""}`}>
            <h3>Location Details</h3>
            <div className="form-group">
              <label>Country:</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Province/State:</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                disabled={!formData.country}
                className="form-select"
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.isoCode} value={province.isoCode}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>City:</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={!formData.province}
                className="form-select"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="next-btn" onClick={nextSection}>
                Next: Parcel Details
              </button>
            </div>
          </div>

          {/* PARCEL DETAILS */}
          <div className={`form-section ${activeSection === "parcel" ? "active" : ""}`}>
            <h3>Parcel Details</h3>
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                name="parcelDescription"
                value={formData.parcelDescription}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="What's in the package?"
              />
            </div>

            <div className="form-group">
              <label>Parcel Size:</label>
              <div className="size-options">
                <label className="size-option">
                  <input
                    type="radio"
                    name="parcelWeight"
                    value="small"
                    checked={formData.parcelWeight === "small"}
                    onChange={handleChange}
                    required
                  />
                  <div className="size-card">
                    <h4>Small</h4>
                    <p>1-3kg</p>
                    <p>Books, documents</p>
                  </div>
                </label>
                
                <label className="size-option">
                  <input
                    type="radio"
                    name="parcelWeight"
                    value="medium"
                    checked={formData.parcelWeight === "medium"}
                    onChange={handleChange}
                  />
                  <div className="size-card">
                    <h4>Medium</h4>
                    <p>3.1-5kg</p>
                    <p>Shoes, small electronics</p>
                  </div>
                </label>
                
                <label className="size-option">
                  <input
                    type="radio"
                    name="parcelWeight"
                    value="large"
                    checked={formData.parcelWeight === "large"}
                    onChange={handleChange}
                  />
                  <div className="size-card">
                    <h4>Large</h4>
                    <p>5.1-10kg</p>
                    <p>Clothing, kitchenware</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="prev-btn" onClick={prevSection}>
                Back
              </button>
              <button type="button" className="next-btn" onClick={nextSection}>
                Next: Sender Details
              </button>
            </div>
          </div>

          {/* SENDER DETAILS */}
          <div className={`form-section ${activeSection === "sender" ? "active" : ""}`}>
            <h3>Sender Details</h3>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="+1 (123) 456-7890"
              />
            </div>

            <div className="form-group">
              <label>Address:</label>
              <textarea
                name="senderAddress"
                value={formData.senderAddress}
                onChange={handleChange}
                required
                className="form-textarea"
                placeholder="Your complete address"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="prev-btn" onClick={prevSection}>
                Back
              </button>
              <button type="button" className="next-btn" onClick={nextSection}>
                Next: Receiver Details
              </button>
            </div>
          </div>

          {/* RECEIVER DETAILS */}
          <div className={`form-section ${activeSection === "receiver" ? "active" : ""}`}>
            <h3>Receiver Details</h3>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Receiver's full name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="+1 (123) 456-7890"
              />
            </div>

            <div className="form-group">
              <label>Address:</label>
              <textarea
                name="receiverAddress"
                value={formData.receiverAddress}
                onChange={handleChange}
                required
                className="form-textarea"
                placeholder="Receiver's complete address"
                rows="3"
              ></textarea>
            </div>

            <AvailableLockers
              city={formData.city}
              parcelDetails={{
                trackingID: formData.riderTrackingID,
                parcelWeight: formData.parcelWeight,
              }}
              onLockerSelect={handleLockerSelect}
              selectedLocker={selectedLocker}
            />
            
            <div className="form-navigation">
              <button type="button" className="prev-btn" onClick={prevSection}>
                Back
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={!formValid || !selectedLocker || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Parcel"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendParcel;