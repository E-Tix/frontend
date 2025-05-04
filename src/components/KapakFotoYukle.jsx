import React, { useState } from "react";
import axios from "axios";

const KapakFotoYukle = ({ etkinlikId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    setYukleniyor(true);

    try {
      await axios.post(`http://localhost:8080/etkinlikler/${etkinlikId}/kapak-foto`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMesaj("Yükleme başarılı!");
    } catch (error) {
      setMesaj("Yükleme sırasında hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={yukleniyor}>
        {yukleniyor ? "Yükleniyor..." : "Yükle"}
      </button>
      <p>{mesaj}</p>
    </div>
  );
};

export default KapakFotoYukle;
