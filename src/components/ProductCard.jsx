function ProductCard({ name, location, image }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} width="100" />
      <h3>{name}</h3>
      <p>{location}</p>
    </div>
  );
}

export default ProductCard;
