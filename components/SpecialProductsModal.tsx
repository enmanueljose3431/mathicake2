
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { SpecialProduct } from '../types';
import { ShoppingCart, Check } from 'lucide-react';

interface SpecialProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: SpecialProduct[];
  onAddToCart: (product: SpecialProduct) => void;
}

const SpecialProductsModal: React.FC<SpecialProductsModalProps> = ({ isOpen, onClose, products, onAddToCart }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [addedFeedback, setAddedFeedback] = React.useState(false);

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
    setAddedFeedback(false);
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    setAddedFeedback(false);
  };

  const handleAddToCart = () => {
    onAddToCart(products[currentIndex]);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  if (!isOpen) return null;

  const currentProduct = products[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full text-gray-800 transition-colors shadow-md"
            >
              <X size={24} />
            </button>

            {/* Image Section */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden bg-gray-100">
              <motion.img
                key={currentProduct.imageUrl}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                src={currentProduct.imageUrl}
                alt={currentProduct.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Navigation Arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <button
                  onClick={prevProduct}
                  className="p-2 bg-white/50 hover:bg-white rounded-full text-gray-800 transition-colors shadow-sm"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextProduct}
                  className="p-2 bg-white/50 hover:bg-white rounded-full text-gray-800 transition-colors shadow-sm"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                    Producto Especial
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight leading-none">
                  {currentProduct.title}
                </h2>
                
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {currentProduct.description}
                </p>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Características</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {currentProduct.characteristics.map((char, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-gray-700">
                        <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                          <Star size={14} fill="currentColor" />
                        </div>
                        <span className="font-medium">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Precio</span>
                    <span className="text-4xl font-black text-primary">${currentProduct.price.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
                      addedFeedback 
                      ? 'bg-green-500 text-white shadow-green-200' 
                      : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
                    }`}
                  >
                    {addedFeedback ? (
                      <>
                        <Check size={18} />
                        Añadido
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        Añadir a la compra
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <div className="flex gap-2">
                    {products.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SpecialProductsModal;
