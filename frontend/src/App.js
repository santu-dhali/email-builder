import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const defaultConfig = {
    title: "Welcome to Our Newsletter",
    subtitle: "Discover the latest updates and exciting news",
    content:
      "Hello there! We are excited to share our latest newsletter with you. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  };

  const [template, setTemplate] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [imageNames, setImageNames] = useState({ logoUrl: "", imageUrl: "" });
  const [emailConfig, setEmailConfig] = useState(() => {
    const savedConfig = localStorage.getItem("emailConfig");

    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      const { logoUrl, imageUrl, ...configWithoutImages } = parsedConfig;
      return configWithoutImages;
    }
    return defaultConfig;
  });

  const [imageUrls, setImageUrls] = useState({
    logoUrl: "",
    imageUrl: ""
  });

  useEffect(() => {
    fetchEmailLayout();
  }, []);

  useEffect(() => {
    if (template) {
      updatePreview({
        ...emailConfig,
        ...imageUrls
      });
    }
  }, [template, emailConfig, imageUrls]);

  useEffect(() => {
    const { logoUrl, imageUrl, ...configWithoutImages } = emailConfig;
    localStorage.setItem("emailConfig", JSON.stringify(configWithoutImages));
  }, [emailConfig]);

  const fetchEmailLayout = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/getEmailLayout");
      setTemplate(response.data.layout);
    } catch (error) {
      console.error("Error fetching layout:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/uploadImage",
        formData
      );
      setImageUrls(prev => ({
        ...prev,
        [type]: response.data.imageUrl
      }));
      setImageNames(prev => ({
        ...prev,
        [type]: file.name
      }));
      e.target.value = '';
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleDeleteImage = (type) => {
    setImageUrls(prev => ({
      ...prev,
      [type]: ""
    }));
    setImageNames(prev => ({
      ...prev,
      [type]: ""
    }));
  };

  const updatePreview = (config) => {
    if (!template) return;
    let preview = template;
    Object.keys(config).forEach((key) => {
      let value = config[key];
      if (key.includes('Url') && !value) {
        value = key === 'logoUrl' ? 'Add Logo' : 'Add Image';
      }
      preview = preview.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    setPreviewHtml(preview);
  };

  const renderImageUpload = (type, label) => {
    const inputId = `${type}-input`;
    const hasImage = !!imageNames[type];

    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="file-upload-container">
          <label htmlFor={inputId} className="upload-button">
            {type === 'logoUrl' ? 'Upload Logo' : 'Upload Image'}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, type)}
            style={{ display: 'none' }}
          />
          {hasImage && (
            <div className="file-info">
              <span className="file-name">{imageNames[type]}</span>
              <button
                className="delete-btn"
                onClick={() => handleDeleteImage(type)}
              >
                ❌
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const saveTemplate = async () => {
    try {
      const completeConfig = {
        ...emailConfig,
        ...imageUrls
      };
      await axios.post("http://localhost:3001/api/uploadEmailConfig", completeConfig);
      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const downloadTemplate = async () => {
    try {
      const completeConfig = {
        ...emailConfig,
        ...imageUrls
      };
      const response = await axios.post(
        "http://localhost:3001/api/renderAndDownloadTemplate",
        completeConfig
      );
      const blob = new Blob([response.data], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `email-template-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  return (
    <div className="container">
      <div className="preview">
        <h2>Preview</h2>
        <div
          className="preview-container"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>

      <div className="editor">
        <h2>Email Editor</h2>
        {renderImageUpload("logoUrl", "Logo")}
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={emailConfig.title}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={emailConfig.subtitle}
            onChange={handleInputChange}
          />
        </div>
        {renderImageUpload("imageUrl", "Main Image")}
        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            value={emailConfig.content}
            onChange={handleInputChange}
          />
        </div>
        <div className="actions">
          <button onClick={saveTemplate}>Save Template</button>
          <button onClick={downloadTemplate}>Download HTML</button>
        </div>
      </div>
    </div>
  );
};

export default App;