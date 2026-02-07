import "../styles/finance-table.css";
import qrCode from "../assets/qrcode.png"; // chỉnh ../ tùy vị trí file

function FinanceTable() {
  return (
    <div className="finance-wrapper">



      <iframe 
        title="Quỹ Bóng 2025 CCF"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRLvVHFhwFPzJZ5H-OV-nk1kDXTFqPzPWn19pbOkv_Y5_jNmgUyogKWTcvpmuFXOA/pubhtml?gid=1775787957&single=true&widget=true&headers=false"
        className="finance-iframe"
      />

            <div className="donation-box">
        <div className="donation-content">

          {/* Text info */}
          <div className="donation-text">
            <h3>Đóng quỹ đội bóng CCF</h3>
            <p><strong>Ngân hàng:</strong> TPBank</p>
            <p><strong>Chủ TK:</strong> Tạ Thu Giang</p>
            <p><strong>SĐT/Số TK:</strong> 88213101984</p>
            <p className="donation-note">
              * Khi chuyển khoản ghi nội dung ngắn gọn<br/>
              Ví dụ: quy bong ccf thang X
            </p>
          </div>

          {/* QR code */}
          <img 
            src={qrCode}
            alt="QR chuyển khoản"
            className="qr-image"
          />

        </div>
      </div>
      
    </div>
  );
}

export default FinanceTable;
