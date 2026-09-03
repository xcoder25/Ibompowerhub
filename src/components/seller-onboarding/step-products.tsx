'use client';

import React, { useState } from 'react';
import { StepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  ProductItem,
  ProductUnit,
  ProductAvailability,
  singleProductSchema,
} from '@/lib/seller-types';
import {
  Plus,
  Trash2,
  Edit2,
  Package,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Upload,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

export function StepProducts({ data, updateData, onNext, onPrev, onSaveDraft, savingDraft }: StepProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  const [mainError, setMainError] = useState<string | null>(null);

  // Form state inside modal
  const [currentProduct, setCurrentProduct] = useState<ProductItem>({
    id: '',
    name: '',
    category: 'Cassava',
    description: '',
    price: 0,
    availableQuantity: 10,
    unit: 'Bag (50kg)',
    minimumOrderQuantity: 1,
    availability: 'Available Now',
    images: [],
  });

  const openAddModal = () => {
    setCurrentProduct({
      id: 'prod_' + Date.now(),
      name: '',
      category: 'Cassava',
      description: '',
      price: 5000,
      availableQuantity: 20,
      unit: 'Bag (50kg)',
      minimumOrderQuantity: 1,
      availability: 'Available Now',
      images: [],
    });
    setEditingIndex(null);
    setProductErrors({});
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setCurrentProduct({ ...data.products[index] });
    setEditingIndex(index);
    setProductErrors({});
    setModalOpen(true);
  };

  const deleteProduct = (index: number) => {
    const next = [...data.products];
    next.splice(index, 1);
    updateData({ products: next });
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to object URL or base64 preview
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setCurrentProduct((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imgIdx: number) => {
    setCurrentProduct((prev) => {
      const nextImgs = [...prev.images];
      nextImgs.splice(imgIdx, 1);
      return { ...prev, images: nextImgs };
    });
  };

  const handleSaveProduct = () => {
    const result = singleProductSchema.safeParse(currentProduct);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errMap[String(err.path[0])] = err.message;
      });
      setProductErrors(errMap);
      return;
    }

    const nextList = [...data.products];
    if (editingIndex !== null) {
      nextList[editingIndex] = currentProduct;
    } else {
      nextList.push(currentProduct);
    }

    updateData({ products: nextList });
    setMainError(null);
    setModalOpen(false);
  };

  const handleContinue = () => {
    if (data.products.length === 0) {
      setMainError('Please register at least one agricultural product before submitting your seller application.');
      return;
    }
    setMainError(null);
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-none font-bold uppercase text-[10px] tracking-wider">
              Step 4 of 7
            </Badge>
            <span className="text-xs text-slate-400">• Produce & Inventory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Agricultural Products & Produce
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            List the agricultural produce, livestock, or inputs you have available for sale.
          </p>
        </div>

        <Button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-4 gap-2 flex-shrink-0 shadow-sm"
        >
          <Plus className="size-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {mainError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{mainError}</span>
        </div>
      )}

      {/* Product List */}
      {data.products.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-center py-12 px-4">
          <CardContent className="space-y-3">
            <div className="size-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <Package className="size-7" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No products registered yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first agricultural product (e.g. Garri, Yellow Yam, Catfish, Fresh Eggs, Palm Oil) with unit pricing and availability.
            </p>
            <Button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-5 gap-1.5 shadow-sm"
            >
              <Plus className="size-4" /> Add First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.products.map((prod, idx) => (
            <Card
              key={prod.id || idx}
              className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex gap-3.5">
                {/* Product Image Thumbnail */}
                <div className="size-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {prod.images && prod.images.length > 0 ? (
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="size-8 text-slate-400" />
                  )}
                  {prod.images && prod.images.length > 1 && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                      +{prod.images.length - 1}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {prod.name}
                      </h4>
                      <Badge
                        className={`text-[9px] font-bold border-none px-2 py-0.5 ${
                          prod.availability === 'Available Now'
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : prod.availability === 'Seasonal'
                            ? 'bg-amber-500/15 text-amber-600'
                            : 'bg-slate-500/15 text-slate-500'
                        }`}
                      >
                        {prod.availability}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {prod.category} • {prod.availableQuantity} {prod.unit}s in stock
                    </p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      ₦{Number(prod.price).toLocaleString()} <span className="text-[10px] font-medium text-slate-400">/ {prod.unit}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(idx)}
                      className="h-7 px-2 text-xs text-slate-600 hover:text-emerald-600 gap-1 rounded-lg"
                    >
                      <Edit2 className="size-3" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProduct(idx)}
                      className="h-7 px-2 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[94vw] sm:max-w-[550px] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              {editingIndex !== null ? 'Edit Agricultural Product' : 'Add New Agricultural Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Product Name <span className="text-emerald-600">*</span>
              </Label>
              <Input
                placeholder="e.g. Yellow Garri (Ijebu Grade) or Fresh Catfish"
                value={currentProduct.name}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, name: e.target.value })
                }
                className="rounded-xl h-10 text-sm"
              />
              {productErrors.name && (
                <p className="text-[11px] font-bold text-rose-500">{productErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Category <span className="text-emerald-600">*</span>
                </Label>
                <Select
                  value={currentProduct.category}
                  onValueChange={(val) =>
                    setCurrentProduct({ ...currentProduct, category: val })
                  }
                >
                  <SelectTrigger className="rounded-xl h-10 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-56">
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <React.Fragment key={cat.group}>
                        <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800">
                          {cat.group}
                        </div>
                        {cat.items.map((item) => (
                          <SelectItem key={item} value={item} className="text-xs">
                            {item}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Measurement Unit <span className="text-emerald-600">*</span>
                </Label>
                <Select
                  value={currentProduct.unit}
                  onValueChange={(val: ProductUnit) =>
                    setCurrentProduct({ ...currentProduct, unit: val })
                  }
                >
                  <SelectTrigger className="rounded-xl h-10 text-sm">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {PRODUCT_UNITS.map((u) => (
                      <SelectItem key={u} value={u} className="text-xs">
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Price (₦) <span className="text-emerald-600">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={currentProduct.price || ''}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      price: Number(e.target.value),
                    })
                  }
                  className="rounded-xl h-10 text-sm"
                />
                {productErrors.price && (
                  <p className="text-[11px] font-bold text-rose-500">{productErrors.price}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Available Quantity <span className="text-emerald-600">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={currentProduct.availableQuantity || ''}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      availableQuantity: Number(e.target.value),
                    })
                  }
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Min Order Qty <span className="text-emerald-600">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  value={currentProduct.minimumOrderQuantity || ''}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      minimumOrderQuantity: Number(e.target.value),
                    })
                  }
                  className="rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Harvest / Product Availability <span className="text-emerald-600">*</span>
              </Label>
              <Select
                value={currentProduct.availability}
                onValueChange={(val: ProductAvailability) =>
                  setCurrentProduct({ ...currentProduct, availability: val })
                }
              >
                <SelectTrigger className="rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Select Availability" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Available Now">Available Now (In Stock)</SelectItem>
                  <SelectItem value="Seasonal">Seasonal (Fresh Harvest)</SelectItem>
                  <SelectItem value="Currently Unavailable">Currently Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Description & Specifications <span className="text-emerald-600">*</span>
              </Label>
              <Textarea
                rows={2}
                placeholder="Give buyers details: grade, organic cultivation, harvest date, packaging..."
                value={currentProduct.description}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, description: e.target.value })
                }
                className="rounded-xl text-sm resize-none"
              />
              {productErrors.description && (
                <p className="text-[11px] font-bold text-rose-500">{productErrors.description}</p>
              )}
            </div>

            {/* Product Image Upload */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Product Images
              </Label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {currentProduct.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative size-16 rounded-xl border overflow-hidden group flex-shrink-0"
                  >
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                <label className="size-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors">
                  <Upload className="size-4 mb-0.5" />
                  <span className="text-[9px] font-bold">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageAdd}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-400">
                High-quality photos of real crops and farm harvests increase buyer trust significantly.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="rounded-xl text-xs h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveProduct}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-5 shadow-sm"
            >
              Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Navigation Buttons */}
      <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
        {onSaveDraft && (
          <Button type="button" variant="outline" onClick={onSaveDraft} disabled={savingDraft}
            className="w-full rounded-xl text-xs font-bold h-10 border-slate-200">
            {savingDraft ? 'Saving Draft...' : 'Save Draft'}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onPrev}
            className="rounded-xl text-xs font-bold h-11 border-slate-200 gap-1 px-3 flex-shrink-0">
            <ArrowLeft className="size-4" />
          </Button>
          <Button type="button" onClick={handleContinue}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-4 shadow-md shadow-emerald-600/20 gap-2">
            <span>Continue</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
