'use client';

interface Product {
  id: string;
  name: string;
  serialNumber: string;
  quantity: number;
  salePrice: number;
  discount: number;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(product.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(product.id);
  };

  return (
    <div className="col-6 col-md-4 col-lg-3">
      <div className="card product-card">
        <div className="card-body text-center">
          <div className="product-image mb-2">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="img-fluid rounded" 
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
            ) : (
              <i className="bi bi-box text-muted" style={{ fontSize: '2rem' }}></i>
            )}
          </div>
          <h6 className="card-title small mb-1" title={product.name}>
            {product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name}
          </h6>
          <p className="card-text text-muted small mb-1">{product.serialNumber}</p>
          <p className="text-success fw-bold mb-1">
            {new Intl.NumberFormat('fa-IR').format(product.salePrice)} تومان
          </p>
          {product.discount > 0 && (
            <span className="badge bg-warning mb-2">{product.discount}%</span>
          )}
          <p className="text-muted small mb-2">موجودی: {product.quantity}</p>
          <div className="btn-group btn-group-sm w-100">
            <button 
              className="btn btn-outline-primary" 
              onClick={handleEdit}
              title="ویرایش"
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button 
              className="btn btn-outline-danger" 
              onClick={handleDelete}
              title="حذف"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
