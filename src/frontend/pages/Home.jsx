import { Categories, FeaturedProducts, Hero, SalesReport } from '../components';
import { useAllProductsContext } from '../contexts/ProductsContextProvider';

const Home = () => {
  const { products: productsFromContext } = useAllProductsContext();

  if (productsFromContext.length < 1) {
    return <main className='full-page'></main>;
  }

  return (
    <main>
      <Hero />
      <SalesReport />
      <Categories />
      <FeaturedProducts />
    </main>
  );
};

export default Home;
