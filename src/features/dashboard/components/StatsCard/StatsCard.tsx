import { useEffect, useState } from "react";
import api from "../core/services/api";

interface CartItem {
  item_id: string;
  item_type: string;
  price: number;
  quantity: number;
}

interface Cart {
  user_id: string;
  items: CartItem[];
  total: number;
  updated_at?: string;
}

export default function Carts() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    try {
      const response = await api.get("/admin/carts");
      setCarts(response.data);
    } catch (error) {
      console.error("Erro ao carregar carrinhos:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSelectedCart(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Carregando carrinhos...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Carrinhos dos Clientes</h1>
        <p className="text-muted-foreground">
          Visualização dos carrinhos ativos no sistema
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carts.map((cart, index) => (
          <div
            key={index}
            onClick={() => setSelectedCart(cart)}
            className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-xl transition cursor-pointer"
          >
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">
                Cliente: {cart.user_id}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {cart.items.length} itens
            </p>

            <p className="text-2xl font-bold text-primary">
              R$ {cart.total?.toFixed(2) || "0.00"}
            </p>

            {cart.updated_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Atualizado em: {new Date(cart.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCart && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-background border rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6">
              Carrinho do Cliente: {selectedCart.user_id}
            </h2>

            <div className="space-y-4">
              {selectedCart.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">
                      {item.item_type.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {item.item_id}
                    </p>
                    <p className="text-sm">
                      Quantidade: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right font-semibold">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>
                R$ {selectedCart.total?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}