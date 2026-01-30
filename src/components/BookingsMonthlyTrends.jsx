import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { bookingsDb } from "../firebase";
import Select from "react-select";

const monthLabels = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const BookingsMonthlyTrends = ({ selectedBookingYear }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const snapshot = await getDocs(
        collection(bookingsDb, "bookings-appointments")
      );
      const allData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get unique services from ALL bookings (not just filtered)
      const services = [...new Set(
        allData
          .map(b => b.service ? b.service.split("-")[0].trim() : null)
          .filter(Boolean)
      )].sort();
      
      setAllServices(services);
      
      // Default to first 3 services selected
      if (selectedServices.length === 0 && services.length > 0) {
        setSelectedServices(services.slice(0, 3));
      }

      // Filter by selected years for chart data
      const filtered = allData.filter((booking) => {
        if (!booking.start || !booking.start.toDate) return false;
        const date = booking.start.toDate();

        return Array.isArray(selectedBookingYear) &&
          (selectedBookingYear.length === 0 ||
            selectedBookingYear.includes(date.getFullYear()));
      });

      setBookings(filtered);
    };

    fetchBookings();
  }, [selectedBookingYear]);

  // Build chart data: month -> service -> count
  const buildChartData = () => {
    const monthServiceMap = {};

    bookings.forEach((booking) => {
      if (!booking.start || !booking.start.toDate || !booking.service) return;
      
      const date = booking.start.toDate();
      const month = date.getMonth();
      const service = booking.service.split("-")[0].trim();
      
      // Only include selected services
      if (!selectedServices.includes(service)) return;
      
      if (!monthServiceMap[month]) {
        monthServiceMap[month] = {};
      }
      
      monthServiceMap[month][service] = (monthServiceMap[month][service] || 0) + 1;
    });

    // Build final chart data
    return monthLabels.map((label, monthIndex) => {
      const entry = { month: label };
      selectedServices.forEach(service => {
        entry[service] = monthServiceMap[monthIndex]?.[service] || 0;
      });
      return entry;
    });
  };

  const chartData = buildChartData();

  // Color palette for different services
  const serviceColors = [
    "#4e79a7", "#f28e2c", "#59a14f", "#e15759",
    "#b07aa1", "#76b7b2", "#edc949", "#af7aa1"
  ];

  const getServiceColor = (service) => {
    const index = selectedServices.indexOf(service);
    return serviceColors[index % serviceColors.length];
  };

  const serviceOptions = allServices.map(s => ({ value: s, label: s }));

  return (
    <div className="monthly-chart" style={{ width: "100%", padding: "1rem" }}>
      <h2 style={{ 
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#1f2937',
        textAlign: 'center'
      }}>
        Monthly Booking Trends by Service
      </h2>

      {/* Service Selector */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ 
          fontWeight: 600, 
          marginBottom: "0.5rem", 
          display: "block",
          color: "#374151"
        }}>
          Select Services to Compare:
        </label>
        <Select
          isMulti
          options={serviceOptions}
          value={serviceOptions.filter(opt => selectedServices.includes(opt.value))}
          onChange={(selected) => 
            setSelectedServices(selected ? selected.map(opt => opt.value) : [])
          }
          placeholder="Select services..."
        />
      </div>

      {/* Line Chart */}
      <div style={{ width: "100%", height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedServices.map((service) => (
              <Line
                key={service}
                type="monotone"
                dataKey={service}
                stroke={getServiceColor(service)}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {selectedServices.length === 0 && (
        <p style={{ textAlign: "center", color: "#6b7280", marginTop: "1rem" }}>
          Please select at least one service to view trends.
        </p>
      )}
    </div>
  );
};

export default BookingsMonthlyTrends;
