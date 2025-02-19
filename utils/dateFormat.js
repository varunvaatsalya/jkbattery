function generateUID() {
    const now = new Date();
  
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
  
    let uniqueDigit = `${year}${month}${date}${hours}${minutes}${seconds}`;
  
    return uniqueDigit;
  }

module.exports = { generateUID };