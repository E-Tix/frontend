import React, { useState, useRef } from "react";
import { FaChair, FaCreditCard, FaRegCreditCard } from "react-icons/fa";
import { SiVisa, SiMastercard } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import "../components/Payment.css";

const Payment = () => {
    const [ticketType, setTicketType] = useState("full");
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [isFlipped, setIsFlipped] = useState(false);
    const cardRef = useRef(null);
    const navigate = useNavigate();

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i=0, len=match.length; i<len; i+=4) {
            parts.push(match.substring(i, i+4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const getCardType = () => {
        if (/^4/.test(cardNumber.replace(/\s/g, ''))) return 'visa';
        if (/^5[1-5]/.test(cardNumber.replace(/\s/g, ''))) return 'mastercard';
        return '';
    };

    const handlePayment = () => {
        // Validasyon
        if (!cardNumber || !cardName || !expiry || !cvv) {
            alert("Lütfen tüm alanları doldurunuz");
            return;
        }

        //Ödeme işlemi süreci
        setTimeout(() => {
            navigate("/payment-success");
        }, 1000);
    };

    return (
        <div className="payment-container">
            <div className="payment-notice">
                <p>Filme ait yaş sınırı ve öğrenci bileti kontrolü için sinema girişinde kimlik ibrazı zorunludur. (Genel izleyici kitlesi için uygundur.)</p>
            </div>
            <div className="payment-divider"></div>

            <div className="payment-section">
                <h2>Ödeme Yöntemleri</h2>
                <p className="payment-method-label">- Banka / Kredi Kartı</p>

                <div className="payment-card-wrapper">
                    <div className="payment-form-container">
                        <div className="payment-form">
                            <div className="form-group">
                                <label>Kart Üzerindeki İsim</label>
                                <input
                                    type="text"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="Kart Üzerindeki İsim"
                                />
                            </div>

                            <div className="form-group">
                                <label>Kart Numarası</label>
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Son Kullanma Tarihi</label>
                                    <input
                                        type="text"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                        placeholder="AA/YY"
                                        maxLength="5"
                                        onFocus={() => setIsFlipped(false)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Güvenlik Kodu</label>
                                    <input
                                        type="text"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        placeholder="CVV"
                                        maxLength="3"
                                        onFocus={handleFlip}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-preview-container">
                        <div
                            className={`credit-card ${isFlipped ? 'flipped' : ''}`}
                            ref={cardRef}
                        >
                            <div className="card-front">
                                <div className="card-top">
                                    <div className="card-chip">
                                        <div className="chip-line"></div>
                                        <div className="chip-line"></div>
                                        <div className="chip-line"></div>
                                        <div className="chip-line"></div>
                                    </div>
                                    {getCardType() === 'visa' && <SiVisa className="card-type-logo" />}
                                    {getCardType() === 'mastercard' && <SiMastercard className="card-type-logo" />}
                                </div>
                                <div className="card-number">
                                    {cardNumber || '•••• •••• •••• ••••'}
                                </div>
                                <div className="card-details">
                                    <div className="card-name">
                                        {cardName || 'AD SOYAD'}
                                    </div>
                                    <div className="card-expiry">
                                        {expiry || 'AA/YY'}
                                    </div>
                                </div>
                            </div>
                            <div className="card-back">
                                <div className="card-stripe"></div>
                                <div className="card-cvv">
                                    <div className="cvv-label">CVV</div>
                                    <div className="cvv-number">{cvv || '•••'}</div>
                                </div>
                                <div className="card-logo-back">
                                    {getCardType() === 'visa' && <SiVisa />}
                                    {getCardType() === 'mastercard' && <SiMastercard />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="payment-info">
                <h2> Bilgilendirme Metni</h2>
                <div className="payment-terms">
                    <label className="checkbox-container">
                        <input type="checkbox" required />
                        <span className="checkmark"></span>
                        <span>E-Tix Kullanım Şartlarını okudum ve organizasyonlarını eksenlik olan kurallarıyla birlikte kabul ediyorum.</span>
                    </label>

                    <label className="checkbox-container">
                        <input type="checkbox" required />
                        <span className="checkmark"></span>
                        <span>Ürün/Hizmet alanlara yönelik aydınlatma metnini okudum ve anladım.</span>
                    </label>
                </div>
            </div>

            <button className="payment-button" onClick={handlePayment}>ÖDEME YAP</button>
        </div>
    );
};

export default Payment;
