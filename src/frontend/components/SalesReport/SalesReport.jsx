import React, { useState, useEffect } from 'react';
import { getDailySalesReportService, getWeeklySalesReportService } from '../../Services/salesService';
import Price from '../Price';
import Title from '../Title/Title';
import styles from './SalesReport.module.css';
import { AiFillFire, AiFillTrophy, AiFillStar } from 'react-icons/ai';
import { BsGraphUp, BsCalendar, BsClock } from 'react-icons/bs';

const SalesReport = () => {
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [daily, weekly] = await Promise.all([
        getDailySalesReportService(),
        getWeeklySalesReportService()
      ]);
      
      setDailyReport(daily);
      setWeeklyReport(weekly);
    } catch (err) {
      setError('Error al cargar los reportes de ventas');
      console.error('Error fetching sales reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchReports, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <section className='section'>
        <div className='container'>
          <Title>Productos Más Vendidos</Title>
          <div className={styles.loading}>
            <span className='loading'></span>
            <p>Cargando reportes de ventas...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='section'>
        <div className='container'>
          <Title>Productos Más Vendidos</Title>
          <div className={styles.error}>
            <p className='error-text'>{error}</p>
            <button className='btn' onClick={fetchReports}>
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  const currentReport = activeTab === 'daily' ? dailyReport : weeklyReport;
  const hasData = currentReport && currentReport.topProducts && currentReport.topProducts.length > 0;

  return (
    <section className='section'>
      <div className='container'>
        <Title>Productos Más Vendidos</Title>
        
        <div className={styles.reportContainer}>
          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.tabButton} ${activeTab === 'daily' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              <BsCalendar />
              Hoy
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('weekly')}
            >
              <BsGraphUp />
              Esta Semana
            </button>
          </div>

          {!hasData ? (
            <div className={styles.noData}>
              <AiFillStar className={styles.noDataIcon} />
              <h3>¡Sé el primero!</h3>
              <p>
                Aún no hay ventas registradas {activeTab === 'daily' ? 'hoy' : 'esta semana'}. 
                ¡Haz tu primera compra y aparece en nuestro ranking!
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className={styles.summaryStats}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <BsGraphUp />
                  </div>
                  <div className={styles.statInfo}>
                    <h4>{currentReport.totalSales}</h4>
                    <p>Ventas Totales</p>
                  </div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <AiFillFire />
                  </div>
                  <div className={styles.statInfo}>
                    <h4>{currentReport.totalItemsSold}</h4>
                    <p>Productos Vendidos</p>
                  </div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <AiFillTrophy />
                  </div>
                  <div className={styles.statInfo}>
                    <h4><Price amount={currentReport.totalRevenue} /></h4>
                    <p>Ingresos Totales</p>
                  </div>
                </div>
              </div>

              {/* Top Products List */}
              <div className={styles.topProductsList}>
                <h3 className={styles.listTitle}>
                  <AiFillFire />
                  Top {currentReport.topProducts.length} Productos Más Vendidos
                </h3>
                
                <div className={styles.productsList}>
                  {currentReport.topProducts.map((product, index) => (
                    <div key={product.productId} className={styles.productItem}>
                      <div className={styles.productRank}>
                        <span className={`${styles.rankNumber} ${index < 3 ? styles.topThree : ''}`}>
                          #{index + 1}
                        </span>
                        {index === 0 && <AiFillTrophy className={styles.goldTrophy} />}
                        {index === 1 && <AiFillTrophy className={styles.silverTrophy} />}
                        {index === 2 && <AiFillTrophy className={styles.bronzeTrophy} />}
                      </div>
                      
                      <div className={styles.productInfo}>
                        <h4 className={styles.productName}>{product.name}</h4>
                        <div className={styles.productStats}>
                          <span className={styles.quantitySold}>
                            <strong>{product.totalQuantitySold}</strong> unidades vendidas
                          </span>
                          <span className={styles.revenue}>
                            Ingresos: <Price amount={product.totalRevenue} />
                          </span>
                          <span className={styles.salesCount}>
                            {product.salesCount} {product.salesCount === 1 ? 'venta' : 'ventas'}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.productBadge}>
                        <AiFillFire />
                        <span>Hot</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Updated */}
              <div className={styles.lastUpdated}>
                <BsClock />
                <span>Última actualización: {new Date(currentReport.lastUpdated).toLocaleString('es-ES')}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default SalesReport;