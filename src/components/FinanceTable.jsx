import "../styles/finance-table.css";

function FinanceTable() {
  return (
    <div className="finance-wrapper">
      <iframe
        title="Quỹ Bóng 2025 CCF"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRLvVHFhwFPzJZ5H-OV-nk1kDXTFqPzPWn19pbOkv_Y5_jNmgUyogKWTcvpmuFXOA/pubhtml?gid=1775787957&amp;single=true&amp;widget=true&amp;headers=false"
        className="finance-iframe"
      />
    </div>
  );
}

export default FinanceTable;
