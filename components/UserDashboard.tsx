
import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Order, AppConfig } from '../types';

interface UserDashboardProps {
  config: AppConfig;
  onExit: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ config, onExit }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showProof, setShowProof] = useState<string | null>(null);

  const canModify = (deliveryDate: string | undefined) => {
    if (!deliveryDate) return false;
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  const calculateNewTotal = (order: Order) => {
    const size = config.sizes.find(s => s.id === order.selectedSizeId) || config.sizes[0];
    const flavor = config.flavors.find(f => f.id === order.selectedFlavorId) || config.flavors[0];
    const filling = config.fillings.find(f => f.id === order.selectedFillingId) || config.fillings[0];
    const decor = config.decorations[order.selectedDecorationId || ''] || { priceModifier: 0 };
    const factor = size.costMultiplier || 1.0;
    
    let total = size.basePrice + (flavor.priceModifier * factor) + (filling.priceModifier * factor) + (decor.priceModifier * factor) + (config.coverageSurcharges[order.coverageType || 'chantilly'] * factor) + (config.topperPrices[order.topperType || 'none'] || 0);
    
    if (order.hasSpheres) total += (config.spheresPrice * factor);
    
    const colorObjs = (order.cakeColors || []).map(hex => config.colors.find(c => c.hex === hex));
    const hasSaturated = colorObjs.some(c => c?.isSaturated);
    if (hasSaturated) total += (config.saturatedColorSurcharge * factor);
    const colorPriceSum = colorObjs.reduce((sum, c) => sum + (c?.priceModifier || 0), 0);
    total += (colorPriceSum * factor);
    
    return total;
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !auth.currentUser) return;

    if (!canModify(editingOrder.deliveryDate)) {
      alert('Los pedidos solo pueden modificarse con al menos 3 días de anticipación.');
      return;
    }

    setIsSaving(true);
    try {
      const newTotal = calculateNewTotal(editingOrder);
      const flavor = config.flavors.find(f => f.id === editingOrder.selectedFlavorId);
      const filling = config.fillings.find(f => f.id === editingOrder.selectedFillingId);
      
      // Actualizar el string de detalles para reflejar los cambios
      let newDetails = editingOrder.details;
      if (flavor) newDetails = newDetails.replace(/🍰 Bizcocho: .*/, `🍰 Bizcocho: ${flavor.name}`);
      if (filling) newDetails = newDetails.replace(/🍦 Relleno: .*/, `🍦 Relleno: ${editingOrder.selectedFillingId === 'others' ? editingOrder.customFilling : filling.name}`);

      const orderRef = doc(db, "orders", editingOrder.id);
      try {
        await updateDoc(orderRef, {
          selectedFlavorId: editingOrder.selectedFlavorId || '',
          selectedFillingId: editingOrder.selectedFillingId || '',
          specialRequirements: editingOrder.specialRequirements || '',
          total: newTotal,
          details: newDetails
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `orders/${editingOrder.id}`);
      }

      // Crear notificación para el admin
      try {
        await addDoc(collection(db, "notifications"), {
          orderId: editingOrder.id,
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || 'Usuario',
          type: 'ORDER_MODIFIED',
          message: `El usuario modificó el pedido #${editingOrder.id.slice(-4)}`,
          timestamp: new Date().toISOString(),
          read: false
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, "notifications");
      }

      setEditingOrder(null);
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error al actualizar el pedido');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orders");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display text-3xl text-primary">Mis Pedidos</h2>
          <p className="text-slate-500 text-sm">Gestiona tus solicitudes y pagos</p>
        </div>
        <button
          onClick={onExit}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all"
        >
          Cerrar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No tienes pedidos registrados</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => {
            const firstColor = order.cakeColors?.[0] || '#E31C58';
            const paid = order.paymentStrategy === 'FIFTY_PERCENT' ? order.total / 2 : 0;
            const pending = order.total - paid;
            const canEdit = order.status === 'PENDING' && canModify(order.deliveryDate);

            return (
              <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden group transition-all hover:shadow-xl">
                <div className="p-6 md:p-8">
                  {/* Header del Pedido */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-5">
                      <div 
                        className="w-16 h-16 rounded-3xl flex items-center justify-center text-[10px] font-black text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform"
                        style={{ backgroundColor: firstColor }}
                      >
                        {firstColor.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-display text-slate-800">{order.customerName}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(order.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Entregado' : 'Pendiente'}
                      </div>
                      <div className="text-right ml-auto md:ml-0">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Total</span>
                        <span className="text-2xl font-display text-primary">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalles y Pagos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em]">Detalles del Pedido</p>
                      <div className="space-y-2">
                        {order.details.split('\n').map((line, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                            <span className="text-lg leading-none">{line.split(' ')[0]}</span>
                            <span>{line.split(' ').slice(1).join(' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em]">Estado de Pago</p>
                      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <div className="grid grid-cols-2 gap-4 divide-x divide-slate-200">
                          <div className="text-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Pagado</span>
                            <span className="text-lg font-display text-green-600">${paid.toFixed(2)}</span>
                          </div>
                          <div className="text-center pl-4">
                            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Pendiente</span>
                            <span className="text-lg font-display text-rose-600">${pending.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                          <p className="text-[10px] text-slate-500 font-bold italic">
                            {order.paymentStrategy === 'FIFTY_PERCENT' ? 'Reserva del 50% confirmada' : 'Pago total requerido al recibir'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {order.paymentProof && (
                          <button
                            onClick={() => setShowProof(order.paymentProof || null)}
                            className="w-full bg-white hover:bg-slate-50 text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 border-slate-100 flex items-center justify-center gap-3 shadow-sm"
                          >
                            <span className="material-icons-round text-lg">receipt_long</span>
                            Ver Comprobante
                          </button>
                        )}

                        {canEdit ? (
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="w-full bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:bg-rose-600 active:scale-95"
                          >
                            <span className="material-icons-round text-lg">edit</span>
                            Modificar Pedido
                          </button>
                        ) : order.status === 'PENDING' && (
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                            <span className="material-icons-round text-amber-500 text-lg">lock</span>
                            <p className="text-[10px] text-amber-700 font-bold uppercase leading-tight">
                              Modificaciones cerradas (Faltan menos de 3 días)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Comprobante */}
      {showProof && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowProof(null)}>
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowProof(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <span className="material-icons-round">close</span>
            </button>
            <img src={showProof} alt="Comprobante de Pago" className="w-full h-auto max-h-[80vh] object-contain" />
            <div className="p-6 text-center">
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Comprobante de Pago Registrado</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {editingOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-display text-xl text-primary">Modificar Pedido #{editingOrder.id.slice(-4)}</h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Sabor del Bizcocho</label>
                <select
                  value={editingOrder.selectedFlavorId || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, selectedFlavorId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary"
                >
                  {config.flavors.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Relleno</label>
                <select
                  value={editingOrder.selectedFillingId || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, selectedFillingId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary"
                >
                  {config.fillings.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Requerimientos Especiales</label>
                <textarea
                  value={editingOrder.specialRequirements || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, specialRequirements: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary min-h-[100px]"
                  placeholder="Ej. Menos azúcar, cambiar color de flores..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
