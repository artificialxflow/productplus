'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'

interface ProductImage {
  id: number
  url: string
  alt: string
  isPrimary: boolean
  order: number
}

interface ImageUploaderProps {
  productId: number
  onImagesChange: (images: ProductImage[]) => void
  existingImages?: ProductImage[]
}

export default function ImageUploader({ productId, onImagesChange, existingImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<ProductImage[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    
    try {
      const newImages: ProductImage[] = []
      
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('alt', file.name)
        formData.append('isPrimary', images.length === 0 ? 'true' : 'false')

        const response = await fetch(`/api/products/${productId}/images`, {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          newImages.push(result.image)
        }
      }

      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
      onImagesChange(updatedImages)
      
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('خطا در آپلود تصاویر')
    } finally {
      setUploading(false)
    }
  }, [images, productId, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  })

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}/images?imageId=${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const updatedImages = images.filter(img => img.id !== imageId)
        setImages(updatedImages)
        onImagesChange(updatedImages)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('خطا در حذف تصویر')
    }
  }

  const handleSetPrimary = async (imageId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId,
          isPrimary: true
        })
      })

      if (response.ok) {
        const updatedImages = images.map(img => ({
          ...img,
          isPrimary: img.id === imageId
        }))
        setImages(updatedImages)
        onImagesChange(updatedImages)
      }
    } catch (error) {
      console.error('Error setting primary image:', error)
      alert('خطا در تنظیم تصویر اصلی')
    }
  }

  const handleReorder = async (imageId: number, newOrder: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId,
          order: newOrder
        })
      })

      if (response.ok) {
        const updatedImages = images.map(img => 
          img.id === imageId ? { ...img, order: newOrder } : img
        ).sort((a, b) => a.order - b.order)
        
        setImages(updatedImages)
        onImagesChange(updatedImages)
      }
    } catch (error) {
      console.error('Error reordering image:', error)
      alert('خطا در تغییر ترتیب تصویر')
    }
  }

  return (
    <div className="image-uploader">
      {/* نمایش تصاویر موجود */}
      {images.length > 0 && (
        <div className="mb-4">
          <h6>تصاویر محصول</h6>
          <div className="row g-3">
            {images.map((image, index) => (
              <div key={image.id} className="col-md-3 col-sm-6">
                <div className="card h-100">
                  <div className="position-relative">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="card-img-top"
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    {image.isPrimary && (
                      <span className="position-absolute top-0 start-0 badge bg-primary m-2">
                        اصلی
                      </span>
                    )}
                    <div className="position-absolute top-0 end-0 m-2">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteImage(image.id)}
                        title="حذف"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body p-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <button
                        className={`btn btn-sm ${image.isPrimary ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleSetPrimary(image.id)}
                        disabled={image.isPrimary}
                      >
                        {image.isPrimary ? 'اصلی' : 'تنظیم اصلی'}
                      </button>
                      <div className="d-flex align-items-center">
                        <label className="form-label me-2 mb-0">ترتیب:</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ width: '60px' }}
                          value={image.order}
                          onChange={(e) => handleReorder(image.id, parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ناحیه آپلود */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'drag-active' : ''} ${dragActive ? 'drag-active' : ''}`}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: isDragActive ? '#f8f9fa' : '#fff'
        }}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div>
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">در حال آپلود...</span>
            </div>
            <p className="text-muted mb-0">در حال آپلود تصاویر...</p>
          </div>
        ) : (
          <div>
            <i className="bi bi-cloud-upload text-muted" style={{ fontSize: '3rem' }}></i>
            <h6 className="mt-3 mb-2">
              {isDragActive ? 'فایل را اینجا رها کنید' : 'تصاویر را اینجا رها کنید یا کلیک کنید'}
            </h6>
            <p className="text-muted mb-2">
              فرمت‌های مجاز: JPEG, PNG, WebP (حداکثر 5MB)
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="bi bi-upload me-2"></i>
              انتخاب فایل
            </button>
          </div>
        )}
      </div>

      {/* راهنما */}
      <div className="mt-3">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          می‌توانید چندین تصویر آپلود کنید. اولین تصویر به عنوان تصویر اصلی در نظر گرفته می‌شود.
        </small>
      </div>
    </div>
  )
}
