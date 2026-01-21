import { Response } from 'miragejs';
import { formatDate, requiresAuth } from '../utils/authUtils';

/**
 * All the routes related to Sales tracking are present here.
 * These handle real sales data when payments are completed.
 */

/**
 * This handler records a sale when payment is completed
 * send POST Request at /api/sales/record
 * body contains {products, totalAmount, paymentId, addressId}
 */
export const recordSaleHandler = function (schema, request) {
  const userId = requiresAuth.call(this, request);
  try {
    if (!userId) {
      return new Response(
        404,
        {},
        {
          errors: ['The email you entered is not Registered. Not Found error'],
        }
      );
    }

    const { products, totalAmount, paymentId, addressId } = JSON.parse(request.requestBody);
    
    // Create sale record
    const saleData = {
      _id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      products: products.map(product => ({
        productId: product._id.split(product.colors[0].color)[0], // Remove color from ID to get original product ID
        name: product.name,
        price: product.price,
        quantity: product.qty,
        color: product.colors[0].color,
        totalPrice: product.price * product.qty
      })),
      totalAmount,
      paymentId,
      addressId,
      saleDate: formatDate(),
      createdAt: formatDate(),
    };

    // Store the sale
    const createdSale = schema.sales.create(saleData);

    // Update product sales count
    products.forEach(product => {
      const originalProductId = product._id.split(product.colors[0].color)[0];
      const existingProduct = schema.products.findBy({ _id: originalProductId });
      
      if (existingProduct) {
        const currentSalesCount = existingProduct.salesCount || 0;
        const currentTotalRevenue = existingProduct.totalRevenue || 0;
        
        existingProduct.update({
          salesCount: currentSalesCount + product.qty,
          totalRevenue: currentTotalRevenue + (product.price * product.qty),
          lastSaleDate: formatDate()
        });
      }
    });

    return new Response(201, {}, { sale: createdSale });
  } catch (error) {
    return new Response(
      500,
      {},
      {
        error: error.message,
      }
    );
  }
};

/**
 * Get daily sales report
 * send GET Request at /api/sales/daily-report
 */
export const getDailySalesReportHandler = function (schema, request) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get all sales from today
    const todaySales = schema.sales.where(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= startOfDay && saleDate < endOfDay;
    });

    // Calculate product sales for today
    const productSales = {};
    
    todaySales.models.forEach(sale => {
      sale.products.forEach(product => {
        if (!productSales[product.productId]) {
          productSales[product.productId] = {
            productId: product.productId,
            name: product.name,
            totalQuantitySold: 0,
            totalRevenue: 0,
            salesCount: 0
          };
        }
        
        productSales[product.productId].totalQuantitySold += product.quantity;
        productSales[product.productId].totalRevenue += product.totalPrice;
        productSales[product.productId].salesCount += 1;
      });
    });

    // Convert to array and sort by quantity sold
    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 10); // Top 10 products

    // Get total sales summary
    const totalSales = todaySales.models.length;
    const totalRevenue = todaySales.models.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItemsSold = Object.values(productSales).reduce((sum, product) => sum + product.totalQuantitySold, 0);

    return new Response(200, {}, {
      dailyReport: {
        date: formatDate(),
        totalSales,
        totalRevenue,
        totalItemsSold,
        topProducts: sortedProducts,
        lastUpdated: formatDate()
      }
    });
  } catch (error) {
    return new Response(
      500,
      {},
      {
        error: error.message,
      }
    );
  }
};

/**
 * Get weekly sales report
 * send GET Request at /api/sales/weekly-report
 */
export const getWeeklySalesReportHandler = function (schema, request) {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all sales from the last 7 days
    const weeklySales = schema.sales.where(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= weekAgo && saleDate <= today;
    });

    // Calculate product sales for the week
    const productSales = {};
    
    weeklySales.models.forEach(sale => {
      sale.products.forEach(product => {
        if (!productSales[product.productId]) {
          productSales[product.productId] = {
            productId: product.productId,
            name: product.name,
            totalQuantitySold: 0,
            totalRevenue: 0,
            salesCount: 0
          };
        }
        
        productSales[product.productId].totalQuantitySold += product.quantity;
        productSales[product.productId].totalRevenue += product.totalPrice;
        productSales[product.productId].salesCount += 1;
      });
    });

    // Convert to array and sort by quantity sold
    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 15); // Top 15 products for weekly

    // Get total sales summary
    const totalSales = weeklySales.models.length;
    const totalRevenue = weeklySales.models.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItemsSold = Object.values(productSales).reduce((sum, product) => sum + product.totalQuantitySold, 0);

    return new Response(200, {}, {
      weeklyReport: {
        dateRange: {
          from: weekAgo.toISOString(),
          to: today.toISOString()
        },
        totalSales,
        totalRevenue,
        totalItemsSold,
        topProducts: sortedProducts,
        lastUpdated: formatDate()
      }
    });
  } catch (error) {
    return new Response(
      500,
      {},
      {
        error: error.message,
      }
    );
  }
};