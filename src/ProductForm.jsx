import { useState, useEffect } from "react";
import axios from "axios";

function ProductForm({ refreshProducts, editingProduct, setEditingProduct }) {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");

    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setDescription(editingProduct.description);
            setPrice(editingProduct.price);
            setQuantity(editingProduct.quantity);
        }
    }, [editingProduct]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingProduct) {
            await axios.put(
                `http://127.0.0.1:8000/api/products/${editingProduct.id}`,
                { name, description, price, quantity }
            );
            setEditingProduct(null);
        } else {
            await axios.post("http://127.0.0.1:8000/api/products", {
                name, description, price, quantity
            });
        }

        refreshProducts();

        setName("");
        setDescription("");
        setPrice("");
        setQuantity("");
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-white">
                {editingProduct ? "Modifier Produit" : "Ajouter Produit"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    className="p-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    className="p-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    className="p-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Prix"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <input
                    className="p-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Quantité"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-bold transition"
            >
                {editingProduct ? "Mettre à jour" : "Ajouter"}
            </button>
        </form>
    );
}

export default ProductForm;