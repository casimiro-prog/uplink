import axios from 'axios';

export const recordSaleService = async (saleData, token) => {
  const response = await axios.post('/api/user/sales/record', saleData, {
    headers: { authorization: token }
  });

  if (response.status === 200 || response.status === 201) {
    return response.data.sale;
  }
};

export const getDailySalesReportService = async () => {
  const response = await axios.get('/api/sales/daily-report');

  if (response.status === 200 || response.status === 201) {
    return response.data.dailyReport;
  }
};

export const getWeeklySalesReportService = async () => {
  const response = await axios.get('/api/sales/weekly-report');

  if (response.status === 200 || response.status === 201) {
    return response.data.weeklyReport;
  }
};