'use client';

import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: Array<{
    id: number;
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  category?: {
    id: number;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { user } = useAuth();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(product.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(product.id);
  };

  // محاسبه قیمت نهایی با تخفیف کاربر
  const userDiscountPercentage = user?.discountPercentage || 0;
  const finalPrice = product.price * (1 - userDiscountPercentage / 100);
  const hasUserDiscount = userDiscountPercentage > 0;

  return (
    <div className="col-6 col-md-4 col-lg-3">
      <div className="card product-card">
        <div className="card-body text-center">
          <div className="product-image mb-2">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images.find(img => img.isPrimary)?.url || product.images[0].url} 
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
          <p className="card-text text-muted small mb-1">{product.description || 'بدون توضیحات'}</p>
          
          {/* نمایش قیمت با تخفیف */}
          <div className="mb-2">
            {hasUserDiscount ? (
              <>
                <p className="text-muted small mb-1">
                  <del>{new Intl.NumberFormat('fa-IR').format(product.price)} تومان</del>
                </p>
                <p className="text-success fw-bold mb-1">
                  {new Intl.NumberFormat('fa-IR').format(finalPrice)} تومان
                </p>
                <span className="badge bg-success mb-1">
                  تخفیف شما: {userDiscountPercentage}%
                </span>
              </>
            ) : (
              <p className="text-success fw-bold mb-1">
                {new Intl.NumberFormat('fa-IR').format(product.price)} تومان
              </p>
            )}
          </div>

          <p className="text-muted small mb-2">موجودی: {product.stock}</p>
          
          {/* نمایش سطح تخفیف کاربر */}
          {user && (
            <div className="mb-2">
              <small className="text-info">
                <i className="bi bi-person-check me-1"></i>
                سطح تخفیف: {userDiscountPercentage}%
              </small>
            </div>
          )}
          
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
