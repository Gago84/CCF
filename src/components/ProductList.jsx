import ProductCard from './ProductCard.jsx';
import penImg from '../assets/pen.jpg';
import notebookImg from '../assets/notebook.jpg';

const mockProducts = [
  { id: 1, name: 'Tạ Thu Giang', location: "Left-back", image: penImg },
  { id: 2, name: 'Tạ Hữu Hoàn', location: "Forward", image: notebookImg },
];

function ProductList() {
  return (
    <div className="product-list">
      {mockProducts.map((p) => (
        <ProductCard key={p.id} name={p.name} location={p.location} image={p.image} />
      ))}
    </div>
  );
}

export default ProductList;
