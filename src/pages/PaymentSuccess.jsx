import React, { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../components/PaymentSuccess.css";

const PaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/");
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="success-container">
            <div className="success-icon animate">
                <FaCheckCircle />
            </div>
            <h1 className="success-title">Ödemeniz Başarıyla Tamamlandı!</h1>
            <p className="success-message">Bilet bilgileriniz e-posta adresinize gönderilmiştir.</p>
        </div>
    );
};

export default PaymentSuccess;