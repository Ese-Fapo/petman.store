"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";
import { assets } from "@/assets/assets";
import { PencilIcon, XIcon } from "lucide-react";

const categories = [
  "Dog Food",
  "Cat Food",
  "Treats",
  "Toys",
  "Bird Care",
  "Small Pets",
  "Bowls",
  "Supplements",
  "Grooming",
  "Beds",
  "Others",
];

const emptyEditForm = {
  id: "",
  name: "",
  description: "",
  mrp: "",
  price: "",
  category: "",
  images: [],
};

export default function StoreManageProducts() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "EUR";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editImages, setEditImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [saving, setSaving] = useState(false);

  const formatPrice = (price) => Number(price || 0).toLocaleString();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/store/product");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (productId) => {
    const response = await fetch("/api/store/stock-toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update product stock");
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, inStock: data.product.inStock }
          : product,
      ),
    );

    return data.message;
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setEditForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      mrp: product.mrp || "",
      price: product.price || "",
      category: product.category || "",
      images: product.images || [],
    });
    setEditImages({ 1: null, 2: null, 3: null, 4: null });
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
    setEditForm(emptyEditForm);
    setEditImages({ 1: null, 2: null, 3: null, 4: null });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const selectedImages = Object.values(editImages).filter(Boolean);
      const formData = new FormData();
      formData.append("productId", editForm.id);
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("mrp", editForm.mrp);
      formData.append("price", editForm.price);
      formData.append("category", editForm.category);
      selectedImages.forEach((image) => formData.append("images", image));

      const response = await fetch("/api/store/product", {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === data.product.id ? data.product : product,
        ),
      );
      closeEditProduct();

      return data.message;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="text-2xl text-slate-500 mb-5">
        Manage <span className="text-slate-800 font-medium">Products</span>
      </h1>
      <div className="max-w-4xl overflow-x-auto rounded ring ring-slate-200">
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 hidden md:table-cell">Description</th>
            <th className="px-4 py-3 hidden md:table-cell">MRP</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {products.length ? (
            products.map((product) => (
              <tr
                key={product.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    {product.images?.[0] ? (
                      <Image
                        width={40}
                        height={40}
                        className="p-1 shadow rounded cursor-pointer"
                        src={product.images[0]}
                        alt={product.name || "Product image"}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100" />
                    )}
                    {product.name || "Unnamed product"}
                  </div>
                </td>
                <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">
                  {product.description || ""}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {currency} {formatPrice(product.mrp)}
                </td>
                <td className="px-4 py-3">
                  {currency} {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditProduct(product)}
                      aria-label={`Edit ${product.name}`}
                      className="flex min-h-9 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <PencilIcon size={16} />
                      <span>Edit</span>
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        onChange={() =>
                          toast.promise(toggleStock(product.id), {
                            loading: "Updating data...",
                            success: (message) =>
                              message || "Product stock updated",
                            error: (error) =>
                              error.message || "Failed to update product stock",
                          })
                        }
                        checked={product.inStock}
                      />
                      <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                    </label>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="border-t border-gray-200">
              <td className="px-4 py-6 text-center text-slate-400" colSpan={5}>
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <form
            onSubmit={(e) =>
              toast.promise(updateProduct(e), {
                loading: "Updating product...",
                success: (message) => message || "Product updated successfully",
                error: (error) => error.message || "Failed to update product",
              })
            }
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-5 text-sm text-slate-500 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl text-slate-800 font-medium">
                  Edit Product
                </h2>
                <p className="mt-1 text-slate-400">
                  Update the listing details customers see in the shop.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditProduct}
                aria-label="Close edit product"
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-100"
              >
                <XIcon size={18} />
              </button>
            </div>

            <p className="mt-6">Product Images</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.keys(editImages).map((key, index) => (
                <label
                  key={key}
                  htmlFor={`edit-image-${key}`}
                  className="cursor-pointer"
                >
                  <Image
                    width={300}
                    height={300}
                    className="h-16 w-16 rounded border border-slate-200 object-cover"
                    src={
                      editImages[key]
                        ? URL.createObjectURL(editImages[key])
                        : editForm.images[index] || assets.upload_area
                    }
                    alt=""
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id={`edit-image-${key}`}
                    onChange={(e) =>
                      setEditImages({ ...editImages, [key]: e.target.files[0] })
                    }
                    hidden
                  />
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Leave images unchanged, or choose new images to replace the
              current set.
            </p>

            <label className="mt-5 flex flex-col gap-2">
              Name
              <input
                type="text"
                name="name"
                onChange={handleEditChange}
                value={editForm.name}
                placeholder="Enter product name"
                className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
                required
              />
            </label>

            <label className="mt-5 flex flex-col gap-2">
              Description
              <textarea
                name="description"
                onChange={handleEditChange}
                value={editForm.description}
                placeholder="Enter product description"
                rows={5}
                className="w-full p-2 px-4 outline-none border border-slate-200 rounded resize-none"
                required
              />
            </label>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                Actual Price
                <input
                  type="number"
                  min={1}
                  name="mrp"
                  onChange={handleEditChange}
                  value={editForm.mrp}
                  placeholder="0"
                  className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                Offer Price
                <input
                  type="number"
                  min={1}
                  name="price"
                  onChange={handleEditChange}
                  value={editForm.price}
                  placeholder="0"
                  className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
                  required
                />
              </label>
            </div>

            <select
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
              value={editForm.category}
              className="mt-5 w-full p-2 px-4 outline-none border border-slate-200 rounded"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                disabled={saving}
                className="rounded bg-slate-800 px-6 py-2 text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={closeEditProduct}
                className="rounded border border-slate-200 px-6 py-2 text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
