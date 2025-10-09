import parse from 'html-react-parser';

import { FEATURE_GROUPS, groupedSet } from './utils'; 
import React, { useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';



const Card = ({ children }) => (
  <div className="p-4 border rounded-lg shadow-sm mb-4">{children}</div>
);
const CardContent = ({ children }) => <div>{children}</div>;

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 bg-blue-600 text-white rounded ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default function MedicalDashboard() {
  const [features, setFeatures] = useState(Array(4).fill(0));
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [treeSVG, setTreeSVG] = useState(null);
  const [result, setResult] = useState(null);
  const [calibration, setCalibration] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const [selectedUsecase, setSelectedUsecase] = useState("Central Nervous System Parenchymal Malignancy");
  const fileInputRef = useRef(null);
  const pf = Array.isArray(result?.parsed_features)
  ? (result.parsed_features[0] || {})
  : (result?.parsed_features || {});

  // Classification Bar Chart Y-Axis Names
  const classNameMap = {
    "Central Nervous System Parenchymal Malignancy": ["No Parenchymal Malignancy", "Parenchymal Malignancy"],
    "Central Nervous System Leptomeningeal Malignancy": ["No Leptomeningeal Malignancy", "Leptomeningeal Malignancy"],
    "Central Nervous System Autoimmune Inflammatory Disease": ["No CNS Inflammation", "CNS Inflammation"],
    "Central Nervous System Infectious Disease": ["No CNS Infectious Disease", "CNS Infectious Disease"]
  };

  const classNames = classNameMap[selectedUsecase] || ["Class 0", "Class 1"];

  // ML Model Options to call from backend
  const modelOptions = [
    "Central Nervous System Parenchymal Malignancy",
    "Central Nervous System Leptomeningeal Malignancy",
    "Central Nervous System Autoimmune Inflammatory Disease",
    "Central Nervous System Infectious Disease"
  ];


  const pdf = new jsPDF("landscape", "pt", "a4");

  const handleExport = async (type) => {
    setShowExportOptions(false);
  
    if (type === "pdf") {
      const exportElement = document.getElementById("export-area");
  
      if (!exportElement) {
        console.error("Export area not found.");
        return;
      }
  
      try {
        const canvas = await html2canvas(exportElement, {
          scale: 2, // Higher quality
          useCORS: true
        });
  
        const imgData = canvas.toDataURL("image/png");
  
        // Standard A4 size in pixels (72 DPI)
        const pdfWidth = 595.28;
        const pdfHeight = 841.89;
  
        const imgProps = {
          width: canvas.width,
          height: canvas.height,
          ratio: canvas.width / canvas.height
        };
  
        const imgScaledWidth = pdfWidth - 40; // padding
        const imgScaledHeight = imgScaledWidth / imgProps.ratio;
  
        const pdf = new jsPDF("p", "pt", "a4");
  
        // Add title
        pdf.setFontSize(18);
        pdf.text("XX Medical Dashboard Results", 40, 30);
  
        // Add image
        pdf.addImage(imgData, "PNG", 20, 50, imgScaledWidth, imgScaledHeight);
  
        // Add note (if space left, else new page)
        const bottomY = 50 + imgScaledHeight + 40;
        if (bottomY + 60 < pdfHeight) {
          pdf.setFontSize(8);
          pdf.setTextColor(255, 0, 0);
          pdf.text(
            "These results are machine-generated and are for exploratory purposes only.",
            40,
            bottomY
          );
        } else {
          pdf.addPage();
          pdf.setFontSize(8);
          pdf.setTextColor(255, 0, 0);
          pdf.text(
            "These results are machine-generated and are for exploratory purposes only.",
            40,
            60
          );
        }
  
        pdf.save("dashboard_results.pdf");
      } catch (error) {
        console.error("PDF export failed:", error);
      }
    }
  };
  

  const handleInputChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = parseFloat(value);
    setFeatures(newFeatures);
  };

  const [uploadedFile, setUploadedFile] = useState(null);

  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file); // Track uploaded file

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_type", selectedUsecase);

    try {
      const res = await axios.post("/upload-pdf/", formData);
      setUploadStatus("PDF uploaded and parsed successfully.");
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("Upload failed.");
    }
  };

  const handlePredict = async () => {
    try {
      const res = await axios.post('/predict');
      setResult(res.data);
    } catch (err) {
      console.error('Prediction error:', err);
    }
  };

  const handleUsecaseChange = (e) => {
    const selected = e.target.value;
    setSelectedUsecase(selected);
    setUploadedFile(null);      // Clear file state
    setUploadStatus("");        // Clear status
    setResult(null);            // Clear prediction
  
    // Clear file input DOM value
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">XX Medical Dashboard</h1>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-1">
          Select Use Case:
        </label>
        <select

          value={selectedUsecase}
          onChange={handleUsecaseChange}
          className="border rounded px-3 py-2 w-full md:w-1/3"

          // value={selectedUsecase}
          // onChange={(e) => {
          //   setSelectedUsecase(e.target.value);
          //   setResult(null); // Clear prediction results when use case changes
          //   setUploadStatus("");
          // }}
          // className="border rounded px-3 py-2 w-full md:w-1/3"
        >
          {modelOptions.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}

          
        </select>
      </div>
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Upload Lab Report PDF</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePDFUpload}
          />
          {uploadStatus && <p className="mt-2 text-sm text-green-600">{uploadStatus}</p>}
          <Button onClick={handlePredict} className="mt-4 bg-red-600">Predict</Button>
        </CardContent>
      </Card>

      {result && (
        <div id="export-area">
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Machine Learning Model Prediction for {selectedUsecase}</h2>
            <p><strong>Predicted Class:</strong> {result.predicted_class}</p>
            {/* Bar Chart Predictions */}
            {/* <div className="mt-4 flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
              <div className="flex-1 border rounded p-4">
                <h3 className="font-semibold mb-2">Class Probabilities</h3> */}

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 mt-4">
              {/* Class Probabilities */}
              <div className="flex-1 border rounded p-4">
                <h3 className="font-semibold mb-2">Class Probabilities</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart
                    layout="vertical"
                    data={result.class_probabilities.map((prob, i) => ({
                      name: classNames[i],
                      value: prob,
                    }))}
                    margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                  >
                    <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    {/* <YAxis type="category" dataKey="name" /> */}
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={150}
                        tick={({ x, y, payload }) => {
                          const maxLabelLength = 20; // You can tweak this
                          const label = payload.value;
                          const fontSize = label.length > maxLabelLength ? 10 : 12;

                          return (
                            <text
                              x={x}
                              y={y + 4}
                              fontSize={fontSize}
                              fill="#374151"
                              textAnchor="end"
                              width={150}
                              overflow="hidden"
                              style={{
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {label}
                            </text>
                          );
                        }}
                      />
                    <Tooltip formatter={(val) => `${(val * 100).toFixed(2)}%`} />
                    <Bar
                      dataKey="value"
                      isAnimationActive={false}
                      label={{
                        position: "right",
                        formatter: (val) => `${(val * 100).toFixed(1)}%`,
                        fill: "#334155",
                        fontSize: 12,
                      }}
                    >
                      {result.class_probabilities.map((prob, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={i === result.predicted_class ? "#2563eb" : "#cbd5e1"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* SHAP Feature Contributions */}
              <div className="flex-1 border rounded p-4">
                {/* <h3 className="mt-4 font-semibold">Feature Contributions Toward Class 1 (Green) vs. Away From Class 1 (Red): Top SHAP Values</h3> */}
                <h3 className="font-semibold mb-2">Feature Contributions</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={result.top_shap_values.map(([feature, value]) => ({
                      name: feature,
                      value: value
                    }))}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <XAxis type="number" domain={[-1, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val) => `${val.toFixed(4)} contribution`} />
                    <Bar
                      dataKey="value"
                      isAnimationActive={false}
                      label={{
                        position: "center",
                        formatter: (val) => val.toFixed(2),
                        fill: "#334155",
                        fontSize: 12
                      }}
                  > 
                    {result.top_shap_values.map(([_, val], i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={val > 0 ? "#22c55e" : "#ef4444"}
                      />
                    ))}
                </Bar>
                <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
            {result.parsed_features && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Parsed Features</h3>
                {FEATURE_GROUPS.map(group => (
                  <div key={group.title} className="mb-8">
                    <h4 className="text-base font-semibold mb-3">{group.title}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {group.features.map(feature => {
                        const value = pf[feature];
                        const isMissing =
                          value == null ||
                          (typeof value === "number" && Number.isNaN(value)) ||
                          (typeof value !== "number" && String(value).trim() === "");

                        return (
                          <div key={feature} className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">{feature}</label>
                            <input
                              type="text"
                              value={
                                isMissing
                                  ? "not specified"
                                  : (typeof value === "number" ? value.toFixed(2) : String(value))
                              }
                              readOnly
                              className={`px-3 py-2 border rounded-md text-sm ${
                                isMissing
                                  ? "bg-red-100 border-red-400 text-red-700"
                                  : "bg-gray-100 border-gray-300 text-gray-800"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}


          </CardContent>
        </Card>
        </div>
      )}

      <div className="relative inline-block text-left z-50">
        <Button onClick={() => setShowExportOptions(!showExportOptions)} className="bg-blue-600">
          Export
        </Button>
        {showExportOptions && (
          <div
            className="absolute mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 right-0 overflow-hidden"
            style={{ maxHeight: "200px" }}
          >
            <div className="py-1">
              <button
                onClick={() => handleExport("pdf")}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Export as PDF
              </button>
              {/* Add others if needed */}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}



