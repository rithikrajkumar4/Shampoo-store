import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { Upload, Filter, Trash2 } from "lucide-react";
import "./CsvFilterPage.css";

const CsvFilterPage = () => {
  const [pageState, setPageState] = useState({
    data: [],
    headers: [],
    filters: [],
    error: "",
  });

  const { data, headers, filters, error } = pageState;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          const fileHeaders = Object.keys(results.data[0]);
          setPageState({
            data: results.data,
            headers: fileHeaders,
            filters: [],
            error: "",
          });
        } else {
          setPageState((prev) => ({
            ...prev,
            error: "The uploaded CSV file appears to be empty.",
          }));
        }
      },
      error: (err) => {
        setPageState((prev) => ({
          ...prev,
          error: "Error parsing CSV file: " + err.message,
        }));
      },
    });
  };

  const addFilter = () => {
    const activeFilterColumns = filters.map((f) => f.column);
    const availableColumn = headers.find(
      (h) => !activeFilterColumns.includes(h),
    );

    if (!availableColumn) return;

    setPageState((prev) => ({
      ...prev,
      filters: [...prev.filters, { column: availableColumn, value: "" }],
    }));
  };

  const updateFilter = (index, key, value) => {
    const updatedFilters = [...filters];
    updatedFilters[index][key] = value;

    setPageState((prev) => ({
      ...prev,
      filters: updatedFilters,
    }));
  };

  const removeFilter = (index) => {
    setPageState((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
    }));
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return filters.every((filter) => {
        if (!filter.column || !filter.value) return true;
        const cellValue = String(row[filter.column] || "").toLowerCase();
        const searchValue = filter.value.toLowerCase();
        return cellValue.includes(searchValue);
      });
    });
  }, [data, filters]);

  const isAddFilterDisabled = filters.length >= headers.length;

  return (
    <div className="csv-container">
      <h1 className="csv-title">Retail Audit Data Viewer</h1>
      <p className="csv-subtitle">
        Upload your CSV containing retail audit metrics to analyze and filter
        data instantly.
      </p>

      <div className="upload-zone">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="upload-input"
        />
        <Upload size={36} color="#9ca3af" />
        <p className="upload-text-main">Click to upload or drag and drop</p>
        <p className="upload-text-sub">Only .csv files are supported</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {data.length > 0 && (
        <div className="filter-panel">
          <div className="filter-header">
            <h2 className="filter-title">
              <Filter size={18} color="#2563eb" /> Active Filters
            </h2>
            <button
              onClick={addFilter}
              className="btn-add-filter"
              disabled={isAddFilterDisabled}
              style={{
                opacity: isAddFilterDisabled ? 0.5 : 1,
                cursor: isAddFilterDisabled ? "not-allowed" : "pointer",
              }}
            >
              {isAddFilterDisabled ? "All Columns Filtered" : "Add Filter"}
            </button>
          </div>

          {filters.length === 0 ? (
            <p
              style={{
                color: "#9ca3af",
                fontStyle: "italic",
                fontSize: "0.875rem",
              }}
            >
              No active filters. Displaying all records.
            </p>
          ) : (
            <div>
              {filters.map((filter, index) => (
                <div key={index} className="filter-row">
                  <select
                    value={filter.column}
                    onChange={(e) =>
                      updateFilter(index, "column", e.target.value)
                    }
                    className="filter-select"
                  >
                    {headers.map((header) => {
                      const isSelectedElsewhere = filters.some(
                        (f, idx) => f.column === header && idx !== index,
                      );
                      if (isSelectedElsewhere) return null;

                      return (
                        <option key={header} value={header}>
                          {header.replace(/_/g, " ")}
                        </option>
                      );
                    })}
                  </select>

                  <div className="filter-input-wrapper">
                    <input
                      type="text"
                      placeholder={`Search in layout...`}
                      value={filter.value}
                      onChange={(e) =>
                        updateFilter(index, "value", e.target.value)
                      }
                      className="filter-input"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>

                  <button
                    onClick={() => removeFilter(index)}
                    className="btn-delete-filter"
                    title="Delete Filter"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="filter-stats">
            Showing <strong>{filteredData.length}</strong> of{" "}
            <strong>{data.length}</strong> entries
          </div>
        </div>
      )}

      {filteredData.length > 0 ? (
        <div className="table-wrapper">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header}>{header.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header) => {
                      const val = row[header];
                      if (val === "true" || val === "Y") {
                        return (
                          <td key={header}>
                            <span className="badge badge-yes">Yes</span>
                          </td>
                        );
                      }
                      if (val === "false" || val === "N") {
                        return (
                          <td key={header}>
                            <span className="badge badge-no">No</span>
                          </td>
                        );
                      }
                      return (
                        <td key={header}>
                          {val || <span style={{ color: "#d1d5db" }}>-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        data.length > 0 && (
          <div className="no-data-alert">
            <p>No data matches your current filter criteria.</p>
          </div>
        )
      )}
    </div>
  );
};

export default CsvFilterPage;
