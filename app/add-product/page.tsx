'use client';

import ProductForm from '@/components/ProductForm'
import Header from '@/components/Header'

export default function AddProduct() {
  return (
    <>
      <Header />
      <ProductForm mode="create" />
    </>
  )
}
